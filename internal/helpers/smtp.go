package helpers

import (
	"fmt"

	"github.com/wneessen/go-mail"
)

type Smtp struct {
	client *mail.Client
}

type SmtpOptions struct {
	Host     string
	Port     int
	Username string
	Password string
}

func NewSmtp(options SmtpOptions) (*Smtp, error) {
	client, err := mail.NewClient(options.Host,
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(options.Username),
		mail.WithPassword(options.Password))

	if err != nil {
		return nil, fmt.Errorf("failed to create SMTP client: %w", err)
	}

	return &Smtp{
		client: client,
	}, nil
}

func (m *Smtp) Send(to string, subject string, body string) error {
	return nil
}
