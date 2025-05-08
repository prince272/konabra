package otp

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"hash"
	"time"
)

const (
	DefaultTokenExpiry = 30 * time.Minute // Default token expiry time
)

type TokenProvider struct {
	secret        []byte
	expires       time.Duration
	hashAlgorithm string
}

type TokenPayload struct {
	Data      map[string]any `json:"data"`
	Timestamp time.Time      `json:"timestamp"`
	Expiry    time.Time      `json:"expiry"`
}

func NewTokenProvider(secret string) (*TokenProvider, error) {
	expiry := DefaultTokenExpiry
	encoder := base64.StdEncoding.WithPadding(base64.StdPadding)
	secret = encoder.EncodeToString([]byte(secret))
	decoded, err := base64.StdEncoding.DecodeString(secret)
	if err != nil {
		return nil, fmt.Errorf("invalid base64 secret: %v", err)
	}
	return &TokenProvider{
		secret:        decoded,
		expires:       expiry,
		hashAlgorithm: "SHA256",
	}, nil
}

func (tp *TokenProvider) GenerateToken(data map[string]any) (string, error) {
	return tp.GenerateTokenForTime(data, time.Now())
}

func (tp *TokenProvider) GenerateTokenForTime(data map[string]any, timestamp time.Time) (string, error) {
	payload := TokenPayload{
		Data:      data,
		Timestamp: timestamp,
		Expiry:    timestamp.Add(tp.expires),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	sig, err := tp.sign(jsonData)
	if err != nil {
		return "", err
	}

	tokenBytes := append(jsonData, sig...)
	return base64.StdEncoding.EncodeToString(tokenBytes), nil
}

func (tp *TokenProvider) ValidateToken(token string) (*TokenPayload, error) {
	return tp.ValidateTokenForTime(token, time.Now())
}

func (tp *TokenProvider) ValidateTokenForTime(token string, timestamp time.Time) (*TokenPayload, error) {
	raw, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return nil, errors.New("invalid base64 token")
	}

	hmacSize, err := tp.hmacSize()
	if err != nil {
		return nil, err
	}
	if len(raw) < hmacSize {
		return nil, errors.New("token too short")
	}

	data := raw[:len(raw)-hmacSize]
	sig := raw[len(raw)-hmacSize:]

	expectedSig, err := tp.sign(data)
	if err != nil {
		return nil, err
	}
	if !hmac.Equal(sig, expectedSig) {
		return nil, errors.New("invalid signature")
	}

	var payload TokenPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return nil, errors.New("invalid payload")
	}

	if timestamp.After(payload.Expiry) {
		return nil, errors.New("token expired")
	}

	return &payload, nil
}

func (tp *TokenProvider) sign(data []byte) ([]byte, error) {
	var h func() hash.Hash
	switch tp.hashAlgorithm {
	case "SHA1":
		h = sha1.New
	case "SHA256":
		h = sha256.New
	case "SHA512":
		h = sha512.New
	default:
		return nil, fmt.Errorf("unsupported hash algorithm: %s", tp.hashAlgorithm)
	}

	mac := hmac.New(h, tp.secret)
	mac.Write(data)
	return mac.Sum(nil), nil
}

func (tp *TokenProvider) hmacSize() (int, error) {
	switch tp.hashAlgorithm {
	case "SHA1":
		return sha1.Size, nil
	case "SHA256":
		return sha256.Size, nil
	case "SHA512":
		return sha512.Size, nil
	default:
		return 0, fmt.Errorf("unsupported hash algorithm: %s", tp.hashAlgorithm)
	}
}
