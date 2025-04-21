package models

type User struct {
	Id            string
	FirstName     string
	LastName      string
	UserName      string
	Email         string
	PhoneNumber   string
	SecurityStamp string
	PasswordHash  string
}
