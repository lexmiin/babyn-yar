// Package users holds administrative users and the rules for their details.
package users

import (
	"errors"
	"net/mail"
	"slices"
	"time"
	"unicode/utf8"

	"github.com/lex-unix/babyn-yar/internal/validator"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicateEmail = errors.New("duplicate email")
	AnonymousUser     = &User{}
)

type User struct {
	ID          int64       `json:"id"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	FullName    string      `json:"fullName"`
	Email       string      `json:"email"`
	Password    Password    `json:"-"`
	Version     int         `json:"-"`
	Permissions Permissions `json:"permissions"`
}

func (u *User) IsAnonymous() bool {
	return u == AnonymousUser
}

type Permissions []string

func (p Permissions) Include(name string) bool {
	return slices.Contains(p, name)
}

// DefaultPasswordCost is the bcrypt cost for new passwords in production.
const DefaultPasswordCost = 12

type Password struct {
	plaintext *string
	hash      []byte
}

// PasswordFromHash rebuilds a stored password.
func PasswordFromHash(hash []byte) Password {
	return Password{hash: hash}
}

// Set hashes the password with the given bcrypt cost. Matches reads the cost
// back from the hash.
func (p *Password) Set(plaintextPassword string, cost int) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), cost)
	if err != nil {
		return err
	}

	p.plaintext = &plaintextPassword
	p.hash = hash

	return nil
}

func (p *Password) Matches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plaintextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}

func (p *Password) Hash() []byte {
	return p.hash
}

func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "must be provided")
	address, err := mail.ParseAddress(email)
	v.Check(err == nil && address.Address == email, "email", "must be a valid email address")
}

func ValidatePasswordPlaintext(v *validator.Validator, password string) {
	v.Check(password != "", "password", "must be provided")
	v.Check(len(password) >= 8, "password", "must be at least 8 characters long")
	v.Check(len(password) <= 72, "password", "must not be more than 72 characters long")
	v.Check(isPrintableASCII(password), "password", "must contain only printable ASCII characters")
}

func isPrintableASCII(value string) bool {
	for _, character := range []byte(value) {
		if character < 0x20 || character > 0x7e {
			return false
		}
	}
	return true
}

func ValidateUser(v *validator.Validator, user *User) {
	v.Check(utf8.RuneCountInString(user.FullName) >= 3, "fullName", "must be at least 3 characters long")
	v.Check(len(user.FullName) <= 500, "fullName", "must not be more than 500 bytes long")

	ValidateEmail(v, user.Email)

	if user.Password.plaintext != nil {
		ValidatePasswordPlaintext(v, *user.Password.plaintext)
	}

	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}
