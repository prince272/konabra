package helpers

import "github.com/wneessen/go-mail"

type Smtp struct {
	client *mail.Client
}

type SmtpOptions struct {
	Host     string
	Port     int
	Username string
	Password string
}

func NewSmtp(options SmtpOptions) *Smtp {
	client, err := mail.NewClient(options.Host,
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(options.Username),
		mail.WithPassword(options.Password))

	if err != nil {
		panic(err)
	}

	return &Smtp{
		client: client,
	}
}

func (m *Smtp) Send(to string, subject string, body string) error {
	return nil
}
