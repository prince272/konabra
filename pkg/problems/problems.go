package problems

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/prince272/konabra/internal/helpers"
)

type Problem struct {
	Type   string            `json:"type,omitempty"`   // A URI reference to the problem type
	Title  string            `json:"title"`            // Short summary of the problem
	Status int               `json:"status"`           // HTTP status code
	Detail string            `json:"detail,omitempty"` // Human-readable explanation
	Errors map[string]string `json:"errors"`           // Field validation errors
}

func NewProblem(status int, title string) *Problem {
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  title,
		Status: status,
		Detail: getProblemDetail(status),
		Errors: map[string]string{},
	}
}

func NewBadRequestProblem(err error) *Problem {
	var errors map[string]string

	if errs, ok := err.(validator.ValidationErrors); ok {
		errors = helpers.GetProcessValidationErrors(errs)
	}

	return NewCustomBadRequestProblem(errors)
}

func NewCustomBadRequestProblem(errors map[string]string) *Problem {
	status := http.StatusBadRequest
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  "One or more validation errors occurred.",
		Status: status,
		Detail: getProblemDetail(status),
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
		Errors: map[string]string{},
	}
}

func getProblemDetail(status int) string {
	switch status {
	// Informational responses (1xx)
	case 100:
		return "Your request is received, please continue sending the rest of the data."
	case 101:
		return "The server is switching protocols as requested."
	case 103:
		return "The server is resuming an interrupted request for data upload."

	// Successful responses (2xx)
	case 200:
		return "Your request is successful."
	case 201:
		return "Your request has created a new resource."
	case 202:
		return "Your request is accepted for processing but not completed yet."
	case 203:
		return "Your request is successful, but the returned data may be from another source."
	case 204:
		return "Your request is successful, but there's no content to return."
	case 205:
		return "Your request is successful, but please reset your document view."
	case 206:
		return "The server is sending only part of the requested resource."

	// Redirection messages (3xx)
	case 300:
		return "You have multiple choices for your request."
	case 301:
		return "The requested page has permanently moved to a new URL."
	case 302:
		return "The requested page has temporarily moved to a new URL."
	case 303:
		return "You can find the requested page under a different URL."
	case 304:
		return "The requested page has not been modified since the last request."
	case 307:
		return "The requested page has temporarily moved to a new URL."
	case 308:
		return "The server is resuming an interrupted request for data upload."

	// Client error responses (4xx)
	case 400:
		return "The request was not processed due to validation errors."
	case 401:
		return "You need to authenticate to access this resource."
	case 403:
		return "Access to the requested resource is forbidden."
	case 404:
		return "The requested resource cannot be found on the server."
	case 405:
		return "The request method is not supported for the requested resource."
	case 408:
		return "The server timed out while waiting for your request."
	case 409:
		return "There is a conflict with your request."
	case 410:
		return "The requested resource is no longer available."
	case 413:
		return "Your request is too large for the server to process."
	case 414:
		return "The requested URL is too long for the server to process."
	case 415:
		return "The requested media type is not supported by the server."

	// Server error responses (5xx)
	case 500:
		return "There's a problem with the server, but it's not specific."
	case 501:
		return "The server doesn't support the functionality required to fulfill your request."
	case 502:
		return "The server received an invalid response from another server while acting as a gateway or proxy."
	case 503:
		return "The server is currently unavailable due to overload or maintenance."
	case 504:
		return "The server didn't receive a timely response from another server while acting as a gateway or proxy."
	case 505:
		return "The server doesn't support the HTTP protocol version used in the request."
	case 511:
		return "You need to authenticate to gain network access."

	default:
		return "An unexpected error occurred."
	}
}

func buildTypeURL(status int) string {
	return fmt.Sprintf("https://httpstatuses.com/%d", status)
}
