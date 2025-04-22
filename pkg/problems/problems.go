package problems

import "fmt"

type Problem struct {
	Type     string `json:"type,omitempty"`     // A URI reference to the problem type
	Title    string `json:"title"`              // Short summary of the problem
	Status   int    `json:"status"`             // HTTP status code
	Detail   string `json:"detail,omitempty"`   // Human-readable explanation
	Instance string `json:"instance,omitempty"` // Request path or unique error ID
}

type ValidationProblem struct {
	Problem
	Errors map[string][]string `json:"errors"` // Field validation errors
}

func NewValidationProblem(status int, errors map[string][]string, instance string) *ValidationProblem {
	return &ValidationProblem{
		Problem: Problem{
			Type:     fmt.Sprintf("https://httpstatuses.com/%d", status),
			Title:    "One or more validation errors occurred.",
			Detail:   "The request was not processed due to validation errors.",
			Status:   status,
			Instance: instance,
		},
		Errors: errors,
	}
}

func NewProblem(status int, title string, instance string) *Problem {
	return &Problem{
		Type:     fmt.Sprintf("https://httpstatuses.com/%d", status),
		Title:    title,
		Detail:   "The request was not processed due to an error.",
		Status:   status,
		Instance: instance,
	}
}
