package validator

import (
	"maps"
	"regexp"
	"slices"
	"strings"
)

type Validator struct {
	Errors map[string]string
}

func New() *Validator {
	return &Validator{Errors: make(map[string]string)}
}

func (v *Validator) Valid() bool {
	return len(v.Errors) == 0
}

// Err returns v as an error when it holds field errors, and nil otherwise.
// Return it instead of v itself: a nil *Validator stored in an error is not nil.
func (v *Validator) Err() error {
	if v.Valid() {
		return nil
	}
	return v
}

func (v *Validator) Error() string {
	keys := slices.Sorted(maps.Keys(v.Errors))
	fields := make([]string, len(keys))
	for i, key := range keys {
		fields[i] = key + ": " + v.Errors[key]
	}
	return "validation failed: " + strings.Join(fields, "; ")
}

func (v *Validator) AddError(key, message string) {
	if _, exists := v.Errors[key]; !exists {
		v.Errors[key] = message
	}
}

func (v *Validator) Check(ok bool, key, message string) {
	if !ok {
		v.AddError(key, message)
	}
}

func In(value string, list ...string) bool {
	return slices.Contains(list, value)
}

func Matches(value string, rx *regexp.Regexp) bool {
	return rx.MatchString(value)
}

func Unique(values []string) bool {
	uniqueValues := make(map[string]bool)

	for _, value := range values {
		uniqueValues[value] = true
	}

	return len(values) == len(uniqueValues)
}
