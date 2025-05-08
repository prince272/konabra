package otp

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"hash"
	"math"
	"time"
)

// Default values as per RFC 6238
const (
	DefaultCodeTimeStep = 30 // 30 seconds
	DefaultCodeDigits   = 6  // 6-digit code
)

// CodeProvider represents a code generator/validator
type CodeProvider struct {
	secret        []byte
	timeStep      int
	digits        int
	hashAlgorithm string
}

// New creates a new CodeProvider instance
func NewCodeProvider(secret string) (*CodeProvider, error) {
	timeStep := DefaultCodeTimeStep
	digits := DefaultCodeDigits
	encoder := base32.StdEncoding.WithPadding(base32.StdPadding)
	secret = encoder.EncodeToString([]byte(secret))
	// Decode the base32 secret
	decodedSecret, err := base32.StdEncoding.DecodeString(secret)
	if err != nil {
		return nil, fmt.Errorf("invalid base32 secret: %v", err)
	}

	if timeStep <= 0 {
		return nil, fmt.Errorf("invalid timeStep: must be greater than 0")
	}

	if digits <= 0 {
		return nil, fmt.Errorf("invalid digits: must be greater than 0")
	}

	return &CodeProvider{
		secret:        decodedSecret,
		timeStep:      timeStep,
		digits:        digits,
		hashAlgorithm: "SHA1",
	}, nil
}

// GenerateCode generates a code for the current time
func (cp *CodeProvider) GenerateCode() (string, error) {
	return cp.GenerateCodeForTime(time.Now())
}

// GenerateCodeForTime generates a code for a specific time
func (cp *CodeProvider) GenerateCodeForTime(timestamp time.Time) (string, error) {
	counter := uint64(timestamp.Unix()) / uint64(cp.timeStep)
	return cp.generateHOTP(counter)
}

// ValidateCode validates a code against the current time
func (cp *CodeProvider) ValidateCode(code string) (bool, error) {
	return cp.ValidateCodeForTime(code, time.Now())
}

// ValidateCodeForTime validates a code against a specific time
// with a default window of ±1 time step (common practice)
func (cp *CodeProvider) ValidateCodeForTime(code string, timestamp time.Time) (bool, error) {
	return cp.ValidateCodeForTimeWithWindow(code, timestamp, 1)
}

// ValidateCodeForTimeWithWindow validates a code against a specific time
// with a configurable window of ±time steps
func (cp *CodeProvider) ValidateCodeForTimeWithWindow(code string, timestamp time.Time, window int) (bool, error) {
	counter := uint64(timestamp.Unix()) / uint64(cp.timeStep)

	for i := -window; i <= window; i++ {
		expectedCode, err := cp.generateHOTP(counter + uint64(i))
		if err != nil {
			return false, err
		}
		if hmac.Equal([]byte(expectedCode), []byte(code)) {
			return true, nil
		}
	}
	return false, nil
}

// generateHOTP generates an HOTP code for the given counter
func (cp *CodeProvider) generateHOTP(counter uint64) (string, error) {
	counterBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(counterBytes, counter)

	var h func() hash.Hash
	switch cp.hashAlgorithm {
	case "SHA1":
		h = sha1.New
	case "SHA256":
		h = sha256.New
	case "SHA512":
		h = sha512.New
	default:
		return "", fmt.Errorf("unsupported hash algorithm: %s", cp.hashAlgorithm)
	}

	mac := hmac.New(h, cp.secret)
	mac.Write(counterBytes)
	hash := mac.Sum(nil)

	offset := hash[len(hash)-1] & 0x0f
	binCode := (uint32(hash[offset])&0x7f)<<24 |
		(uint32(hash[offset+1])&0xff)<<16 |
		(uint32(hash[offset+2])&0xff)<<8 |
		(uint32(hash[offset+3]) & 0xff)

	// Use integer exponentiation to avoid potential floating point precision issues
	otp := binCode % uint32(int(math.Pow10(cp.digits)))

	format := fmt.Sprintf("%%0%dd", cp.digits)
	return fmt.Sprintf(format, otp), nil
}
