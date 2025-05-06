package helpers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"strings"
	"time"

	"golang.org/x/crypto/hkdf"
)

type Protector struct {
	aesKey  []byte
	hmacKey []byte
}

func NewProtector(masterKey []byte) (*Protector, error) {
	if len(masterKey) != 64 {
		return nil, errors.New("master key must be 64 bytes")
	}

	// Derive 32-byte AES key and 32-byte HMAC key using HKDF
	hkdfReader := hkdf.New(sha256.New, masterKey, nil, []byte("xai-protector-key-derivation"))
	derivedKey := make([]byte, 64) // 32 for AES + 32 for HMAC
	if _, err := io.ReadFull(hkdfReader, derivedKey); err != nil {
		return nil, fmt.Errorf("failed to derive keys: %w", err)
	}

	aesKey := derivedKey[:32]
	hmacKey := derivedKey[32:]

	if len(aesKey) != 32 {
		return nil, errors.New("derived AES key must be 32 bytes")
	}
	if len(hmacKey) != 32 {
		return nil, errors.New("derived HMAC key must be 32 bytes")
	}

	return &Protector{aesKey, hmacKey}, nil
}

type Envelope struct {
	Version   string `json:"version"`
	Payload   string `json:"payload"`
	Signature string `json:"signature"`
}

type Payload struct {
	Value     string            `json:"value"`
	Metadata  map[string]string `json:"metadata,omitempty"`
	Version   string            `json:"version"`
	ExpiresAt int64             `json:"expiresAt"`
}

type TokenInfo struct {
	Value     string
	Metadata  map[string]string
	ExpiresAt time.Time
	Signature string
}

type ShortCodeInfo struct {
	Code      string
	Metadata  map[string]string
	ExpiresAt time.Time
	Signature string
}

func (p *Protector) GenerateToken(expiresIn time.Duration, metadata map[string]string) (*TokenInfo, error) {
	value, err := generateAlphanumericCode(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate alphanumeric code: %w", err)
	}
	expiry := time.Now().UTC().Add(expiresIn)

	payload := Payload{
		Value:     value,
		Metadata:  metadata,
		Version:   "v1",
		ExpiresAt: expiry.Unix(),
	}
	encoded, err := p.encryptAndSign(payload)
	if err != nil {
		return nil, err
	}

	info := &TokenInfo{
		Value:     value,
		Metadata:  metadata,
		ExpiresAt: expiry,
		Signature: encoded,
	}
	return info, nil
}

func (p *Protector) VerifyToken(encoded, expectedToken string) (*TokenInfo, error) {
	var payload Payload
	env, err := p.decryptAndVerify(encoded, &payload)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt and verify token: %w", err)
	}

	if payload.Value != expectedToken {
		return nil, fmt.Errorf("expected token '%v', got '%v'", expectedToken, payload.Value)
	}

	if time.Now().UTC().Unix() > payload.ExpiresAt {
		return nil, errors.New("token has expired")
	}

	return &TokenInfo{
		Value:     payload.Value,
		Metadata:  payload.Metadata,
		ExpiresAt: time.Unix(payload.ExpiresAt, 0).UTC(),
		Signature: env.Signature,
	}, nil
}

func (p *Protector) GenerateShortCode(codeType string, length int, expiresIn time.Duration, metadata map[string]string) (*ShortCodeInfo, error) {
	var code string
	var err error

	switch codeType {
	case "numeric":
		code, err = generateNumericCode(length)
	case "alphanumeric":
		code, err = generateAlphanumericCode(length)
	default:
		return nil, fmt.Errorf("invalid code type '%v'", codeType)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to generate code: %w", err)
	}

	expiry := time.Now().UTC().Add(expiresIn)

	payload := Payload{
		Value:     code,
		Metadata:  metadata,
		Version:   "v1",
		ExpiresAt: expiry.Unix(),
	}
	encoded, err := p.encryptAndSign(payload)
	if err != nil {
		return nil, err
	}

	info := &ShortCodeInfo{
		Code:      code,
		Metadata:  metadata,
		ExpiresAt: expiry,
		Signature: encoded,
	}
	return info, nil
}

func (p *Protector) VerifyShortCode(encoded, expectedCode string) (*ShortCodeInfo, error) {
	var payload Payload
	env, err := p.decryptAndVerify(encoded, &payload)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt and verify shortcode: %w", err)
	}

	if time.Now().UTC().Unix() > payload.ExpiresAt {
		return nil, errors.New("shortcode has expired")
	}

	if payload.Value != expectedCode {
		return nil, fmt.Errorf("expected code '%v', got '%v'", expectedCode, payload.Value)
	}

	return &ShortCodeInfo{
		Code:      payload.Value,
		Metadata:  payload.Metadata,
		ExpiresAt: time.Unix(payload.ExpiresAt, 0).UTC(),
		Signature: env.Signature,
	}, nil
}

func (p *Protector) encryptAndSign(payload Payload) (string, error) {
	raw, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}
	ciphertext, err := p.encrypt(raw)
	if err != nil {
		return "", fmt.Errorf("failed to encrypt payload: %w", err)
	}
	cipherB64 := base64.StdEncoding.EncodeToString(ciphertext)
	sig := p.calculateEnvelopeHMAC(cipherB64, payload.Version)
	env := Envelope{
		Version:   payload.Version,
		Payload:   cipherB64,
		Signature: base64.StdEncoding.EncodeToString(sig),
	}
	envBytes, err := json.Marshal(env)
	if err != nil {
		return "", fmt.Errorf("failed to marshal envelope: %w", err)
	}
	return base64.StdEncoding.EncodeToString(envBytes), nil
}

func (p *Protector) decryptAndVerify(encoded string, dest *Payload) (*Envelope, error) {
	envBytes, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, fmt.Errorf("failed to decode envelope: %w", err)
	}
	var env Envelope
	if err := json.Unmarshal(envBytes, &env); err != nil {
		return nil, fmt.Errorf("failed to unmarshal envelope: %w", err)
	}
	expectedMAC := p.calculateEnvelopeHMAC(env.Payload, env.Version)
	actualMAC, err := base64.StdEncoding.DecodeString(env.Signature)
	if err != nil {
		return nil, fmt.Errorf("invalid signature encoding: %w", err)
	}
	if !hmac.Equal(expectedMAC, actualMAC) {
		return nil, errors.New("invalid signature")
	}
	cipherBytes, err := base64.StdEncoding.DecodeString(env.Payload)
	if err != nil {
		return nil, fmt.Errorf("failed to decode payload: %w", err)
	}
	plain, err := p.decrypt(cipherBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt payload: %w", err)
	}
	if err := json.Unmarshal(plain, dest); err != nil {
		return nil, fmt.Errorf("failed to unmarshal payload: %w", err)
	}
	return &env, nil
}

func (p *Protector) encrypt(plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(p.aesKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}
	nonce := make([]byte, 12)
	if _, err := rand.Read(nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM cipher: %w", err)
	}
	return append(nonce, aesgcm.Seal(nil, nonce, plaintext, nil)...), nil
}

func (p *Protector) decrypt(ciphertext []byte) ([]byte, error) {
	block, err := aes.NewCipher(p.aesKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM cipher: %w", err)
	}
	if len(ciphertext) < 12 {
		return nil, errors.New("ciphertext too short")
	}
	nonce := ciphertext[:12]
	return aesgcm.Open(nil, nonce, ciphertext[12:], nil)
}

func (p *Protector) calculateEnvelopeHMAC(payloadBase64, version string) []byte {
	msg := fmt.Sprintf("%v|%v", payloadBase64, version)
	h := hmac.New(sha256.New, p.hmacKey)
	h.Write([]byte(msg))
	return h.Sum(nil)
}

func generateAlphanumericCode(length int) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var result strings.Builder
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random alphanumeric character: %w", err)
		}
		result.WriteByte(letters[n.Int64()])
	}
	return result.String(), nil
}

func generateNumericCode(length int) (string, error) {
	const digits = "0123456789"
	var result strings.Builder
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random numeric character: %w", err)
		}
		result.WriteByte(digits[n.Int64()])
	}
	return result.String(), nil
}
