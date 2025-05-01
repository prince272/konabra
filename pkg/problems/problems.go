package problems

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/prince272/konabra/utils"
)

type Problem struct {
	Type   string            `json:"type,omitempty"`   // A URI reference to the problem type
	Title  string            `json:"title"`            // Short summary of the problem
	Status int               `json:"status"`           // HTTP status code
	Detail string            `json:"detail,omitempty"` // Human-readable explanation
	Errors map[string]string `json:"errors"`           // Field validation errors
}

func buildTypeURL(status int) string {
	return fmt.Sprintf("https://httpstatuses.com/%d", status)
}

func NewProblem(status int, title, detail string) *Problem {
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  title,
		Status: status,
		Detail: detail,
	}
}

func NewValidationProblem(err error) *Problem {
	status := http.StatusBadRequest
	var errors map[string]string

	if errs, ok := err.(validator.ValidationErrors); ok {
		errors = utils.ProcessValidationErrors(errs) // Use the new method to process validation errors
	}

	return &Problem{
		Type:   buildTypeURL(status),
		Title:  "One or more validation errors occurred.",
		Detail: "The request was not processed due to validation errors.",
		Status: status,
		Errors: errors,
	}
}

func NewInternalServerProblem(err error) *Problem {
	status := http.StatusInternalServerError
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  "Internal Server Error",
		Status: status,
		Detail: fmt.Sprintf("An unexpected error occurred: %s", err.Error()),
	}
}
