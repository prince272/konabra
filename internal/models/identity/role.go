package models

type Role struct {
	Id    string `gorm:"primaryKey"`
	Name  string
	Users []*User `gorm:"many2many:user_roles;"`
}

var (
	RoleAdministrator = "Administrator"
	RoleModerator     = "Moderator"
	RoleReporter      = "Reporter"
	RoleResponder     = "Responder"
)

var RoleAll = []string{
	RoleAdministrator,
	RoleModerator,
	RoleReporter,
	RoleResponder,
}
