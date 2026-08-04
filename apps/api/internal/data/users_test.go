package data

import (
	"strings"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/validator"
	"github.com/stretchr/testify/assert"
)

func TestValidatePasswordPlaintext(t *testing.T) {
	testCases := []struct {
		name      string
		password  string
		wantValid bool
	}{
		{name: "minimum length", password: "12345678", wantValid: true},
		{name: "printable ASCII with spaces", password: "two words!", wantValid: true},
		{name: "maximum length", password: strings.Repeat("a", 72), wantValid: true},
		{name: "too short", password: "1234567", wantValid: false},
		{name: "too long", password: strings.Repeat("a", 73), wantValid: false},
		{name: "unicode", password: "пароль123", wantValid: false},
		{name: "tab", password: "password\t", wantValid: false},
		{name: "newline", password: "password\n", wantValid: false},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			v := validator.New()
			ValidatePasswordPlaintext(v, testCase.password)
			assert.Equal(t, testCase.wantValid, v.Valid())
		})
	}
}
