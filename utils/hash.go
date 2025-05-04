package utils

import (
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func MustHashPassword(password string) string {
	bytes, err := HashPassword(password)
	if err != nil {
		panic(err)
	}
	return bytes
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// HashToken hashes the given token using SHA-256 and returns the hex string.
func HashToken(token string) string {
	hasher := sha256.New()
	hasher.Write([]byte(token))
	return hex.EncodeToString(hasher.Sum(nil))
}

// CheckTokenHash compares a plain token to a previously hashed token.
func CheckTokenHash(token, hashed string) bool {
	return HashToken(token) == hashed
}
