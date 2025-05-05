package problems

import (
	"fmt"
	"net/http"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/gobeam/stringy"
)

type Problem struct {
	Type   string            `json:"type,omitempty"`   // A URI reference to the problem type
	Title  string            `json:"title"`            // Short summary of the problem
	Status int               `json:"status"`           // HTTP status code
	Detail *string           `json:"detail,omitempty"` // Human-readable explanation
	Errors map[string]string `json:"errors"`           // Field validation errors
	Reason string            `json:"reason"`
}

func NewProblem(status int, title string) *Problem {
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  title,
		Status: status,
		Errors: map[string]string{},
	}
}

func NewValidationProblem(errors map[string]string) *Problem {
	status := http.StatusBadRequest
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  "One or more validation errors occurred.",
		Status: status,
		Errors: errors,
	}
}

func FromError(err error) *Problem {
	var errors map[string]string
	if errs, ok := err.(validator.ValidationErrors); ok {
		errors = getProcessValidationErrors(errs)
		return NewValidationProblem(errors)
	} else {
		status := http.StatusInternalServerError
		return &Problem{
			Type:   buildTypeURL(status),
			Title:  "An internal server error has occurred.",
			Status: status,
			Detail: func(s string) *string { return &s }(err.Error()),
			Errors: map[string]string{},
		}
	}
}

func (problem *Problem) WithReason(reason string) *Problem {
	problem.Reason = reason
	return problem
}

func getProcessValidationErrors(errs validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)
	for _, fieldError := range errs {
		var errorMessage string
		fieldValue := fieldError.Value().(string)

		switch fieldError.Tag() {
		case "required":
			errorMessage = fmt.Sprintf("%v is required.", fieldError.Field())
		case "email":
			errorMessage = fmt.Sprintf("%v must be a valid email address.", fieldError.Field())
		case "gte":
			errorMessage = fmt.Sprintf("%v must be greater than or equal to %v.", fieldError.Field(), fieldError.Param())
		case "lte":
			errorMessage = fmt.Sprintf("%v must be less than or equal to %v.", fieldError.Field(), fieldError.Param())
		case "password":
			errorMessage = fmt.Sprintf("%v must be 6-256 characters long and include uppercase, lowercase, number, and special character.", fieldError.Field())
		case "username":
			if maybePhoneNumber(fieldValue) {
				errorMessage = fmt.Sprintf("%v must be a valid phone number.", fieldError.Field())
			} else {
				errorMessage = fmt.Sprintf("%v must be a valid email address.", fieldError.Field())
			}
		default:
			errorMessage = fmt.Sprintf("%v is not valid.", fieldError.Field())
		}

		errorField := stringy.New(fieldError.Field()).CamelCase().Get()
		errors[errorField] = errorMessage
	}
	return errors
}

func maybePhoneNumber(input string) bool {
	phonePattern := regexp.MustCompile(`^[-+0-9() ]+$`)
	return phonePattern.MatchString(input)
}

func buildTypeURL(status int) string {
	return fmt.Sprintf("https://httpstatuses.com/%d", status)
}
