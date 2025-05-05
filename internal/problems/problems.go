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
	Reason string            `json:"reason"`           // Reason for the error
}

func NewProblem(status int, title string) *Problem {
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  title,
		Status: status,
		Errors: map[string]string{},
		Reason: getReasonPhrase(status),
	}
}

func NewValidationProblem(errors map[string]string) *Problem {
	status := http.StatusBadRequest
	return &Problem{
		Type:   buildTypeURL(status),
		Title:  "One or more validation errors occurred.",
		Status: status,
		Errors: errors,
		Reason: getReasonPhrase(status),
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
			Reason: getReasonPhrase(status),
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

func getReasonPhrase(statusCode int) string {
	if statusCode >= 100 && statusCode < 600 {
		group := statusCode / 100
		index := statusCode % 100

		if group >= 1 && group <= 5 && index < len(reasonPhrases[group]) {
			return reasonPhrases[group][index]
		}
	}
	return ""
}

// httpReasonPhrases contains all standard HTTP reason phrases grouped by status code hundreds.
var reasonPhrases = [][]string{
	{}, // 0xx - not used
	{ // 1xx
		/* 100 */ "Continue",
		/* 101 */ "Switching Protocols",
		/* 102 */ "Processing",
	},
	{ // 2xx
		/* 200 */ "OK",
		/* 201 */ "Created",
		/* 202 */ "Accepted",
		/* 203 */ "Non-Authoritative Information",
		/* 204 */ "No Content",
		/* 205 */ "Reset Content",
		/* 206 */ "Partial Content",
		/* 207 */ "Multi-Status",
		/* 208 */ "Already Reported",
		/* 209 */ "",
		/* 210 */ "",
		/* 211 */ "",
		/* 212 */ "",
		/* 213 */ "",
		/* 214 */ "",
		/* 215 */ "",
		/* 216 */ "",
		/* 217 */ "",
		/* 218 */ "",
		/* 219 */ "",
		/* 220 */ "",
		/* 221 */ "",
		/* 222 */ "",
		/* 223 */ "",
		/* 224 */ "",
		/* 225 */ "",
		/* 226 */ "IM Used",
	},
	{ // 3xx
		/* 300 */ "Multiple Choices",
		/* 301 */ "Moved Permanently",
		/* 302 */ "Found",
		/* 303 */ "See Other",
		/* 304 */ "Not Modified",
		/* 305 */ "Use Proxy",
		/* 306 */ "Switch Proxy",
		/* 307 */ "Temporary Redirect",
		/* 308 */ "Permanent Redirect",
	},
	{ // 4xx
		/* 400 */ "Bad Request",
		/* 401 */ "Unauthorized",
		/* 402 */ "Payment Required",
		/* 403 */ "Forbidden",
		/* 404 */ "Not Found",
		/* 405 */ "Method Not Allowed",
		/* 406 */ "Not Acceptable",
		/* 407 */ "Proxy Authentication Required",
		/* 408 */ "Request Timeout",
		/* 409 */ "Conflict",
		/* 410 */ "Gone",
		/* 411 */ "Length Required",
		/* 412 */ "Precondition Failed",
		/* 413 */ "Payload Too Large",
		/* 414 */ "URI Too Long",
		/* 415 */ "Unsupported Media Type",
		/* 416 */ "Range Not Satisfiable",
		/* 417 */ "Expectation Failed",
		/* 418 */ "I'm a teapot",
		/* 419 */ "Authentication Timeout",
		/* 420 */ "",
		/* 421 */ "Misdirected Request",
		/* 422 */ "Unprocessable Entity",
		/* 423 */ "Locked",
		/* 424 */ "Failed Dependency",
		/* 425 */ "",
		/* 426 */ "Upgrade Required",
		/* 427 */ "",
		/* 428 */ "Precondition Required",
		/* 429 */ "Too Many Requests",
		/* 430 */ "",
		/* 431 */ "Request Header Fields Too Large",
		/* 432 */ "",
		/* 433 */ "",
		/* 434 */ "",
		/* 435 */ "",
		/* 436 */ "",
		/* 437 */ "",
		/* 438 */ "",
		/* 439 */ "",
		/* 440 */ "",
		/* 441 */ "",
		/* 442 */ "",
		/* 443 */ "",
		/* 444 */ "",
		/* 445 */ "",
		/* 446 */ "",
		/* 447 */ "",
		/* 448 */ "",
		/* 449 */ "",
		/* 450 */ "",
		/* 451 */ "Unavailable For Legal Reasons",
		/* 452 */ "",
		/* 453 */ "",
		/* 454 */ "",
		/* 455 */ "",
		/* 456 */ "",
		/* 457 */ "",
		/* 458 */ "",
		/* 459 */ "",
		/* 460 */ "",
		/* 461 */ "",
		/* 462 */ "",
		/* 463 */ "",
		/* 464 */ "",
		/* 465 */ "",
		/* 466 */ "",
		/* 467 */ "",
		/* 468 */ "",
		/* 469 */ "",
		/* 470 */ "",
		/* 471 */ "",
		/* 472 */ "",
		/* 473 */ "",
		/* 474 */ "",
		/* 475 */ "",
		/* 476 */ "",
		/* 477 */ "",
		/* 478 */ "",
		/* 479 */ "",
		/* 480 */ "",
		/* 481 */ "",
		/* 482 */ "",
		/* 483 */ "",
		/* 484 */ "",
		/* 485 */ "",
		/* 486 */ "",
		/* 487 */ "",
		/* 488 */ "",
		/* 489 */ "",
		/* 490 */ "",
		/* 491 */ "",
		/* 492 */ "",
		/* 493 */ "",
		/* 494 */ "",
		/* 495 */ "",
		/* 496 */ "",
		/* 497 */ "",
		/* 498 */ "",
		/* 499 */ "Client Closed Request",
	},
	{ // 5xx
		/* 500 */ "Internal Server Error",
		/* 501 */ "Not Implemented",
		/* 502 */ "Bad Gateway",
		/* 503 */ "Service Unavailable",
		/* 504 */ "Gateway Timeout",
		/* 505 */ "HTTP Version Not Supported",
		/* 506 */ "Variant Also Negotiates",
		/* 507 */ "Insufficient Storage",
		/* 508 */ "Loop Detected",
		/* 509 */ "",
		/* 510 */ "Not Extended",
		/* 511 */ "Network Authentication Required",
	},
}
