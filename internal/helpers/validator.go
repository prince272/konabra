package helpers

import (
	"fmt"
	"regexp"
	"unicode/utf8"

	"github.com/go-playground/validator/v10"
	"github.com/nyaruka/phonenumbers"
)

type Validator struct {
	validate *validator.Validate
}

func NewValidator() (*Validator, error) {
	validate := validator.New()
	if err := validate.RegisterValidation("username", ValidateUsername); err != nil {
		return nil, fmt.Errorf("failed to register username validator: %w", err)
	}

	if err := validate.RegisterValidation("password", ValidatePassword); err != nil {
		return nil, fmt.Errorf("failed to register password validator: %w", err)
	}
	return &Validator{
		validate: validate,
	}, nil
}

func (helper *Validator) ValidateStruct(s any) error {
	return helper.validate.Struct(s)
}

// ValidatePassword checks password strength
func ValidatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	length := utf8.RuneCountInString(password)

	if length < 6 || length > 256 {
		return false
	}

	upper := regexp.MustCompile(`[A-Z]`)
	lower := regexp.MustCompile(`[a-z]`)
	digit := regexp.MustCompile(`[0-9]`)
	special := regexp.MustCompile(`[^a-zA-Z0-9]`)

	return upper.MatchString(password) &&
		lower.MatchString(password) &&
		digit.MatchString(password) &&
		special.MatchString(password)
}

// ValidateUsername determines whether input is a valid phone or email
func ValidateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	return IsPhoneNumber(username) || IsEmail(username)
}

// Helper: Check if input is phone number using phonenumbers lib
func IsPhoneNumber(input string) bool {
	num, err := phonenumbers.Parse(input, "") // Adjust default region as needed
	if err != nil {
		return false
	}
	return phonenumbers.IsValidNumber(num)
}

// Helper: Check if input is email
func IsEmail(input string) bool {
	emailPattern := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailPattern.MatchString(input)
}
