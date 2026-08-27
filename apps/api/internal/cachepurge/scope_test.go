package cachepurge

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestScopePrefixes(t *testing.T) {
	tests := []struct {
		name     string
		siteURL  string
		scope    string
		expected []string
		wantErr  bool
	}{
		{name: "gallery", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "gallery", expected: []string{"babynyar.gov.ua/gallery", "babynyar.gov.ua/en/gallery"}},
		{name: "events", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "event", expected: []string{"babynyar.gov.ua/events", "babynyar.gov.ua/en/events"}},
		{name: "books", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "book", expected: []string{"babynyar.gov.ua/education/library", "babynyar.gov.ua/en/education/library"}},
		{name: "Holocaust documents", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "holocaust_document", expected: []string{"babynyar.gov.ua/holocaust/documents", "babynyar.gov.ua/en/holocaust/documents"}},
		{name: "testimonies", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "victim_testimony", expected: []string{"babynyar.gov.ua/holocaust/testimonies", "babynyar.gov.ua/en/holocaust/testimonies"}},
		{name: "media articles", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "media_article", expected: []string{"babynyar.gov.ua/media-articles", "babynyar.gov.ua/en/media-articles"}},
		{name: "partners", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "partner", expected: []string{"babynyar.gov.ua/partners", "babynyar.gov.ua/en/partners"}},
		{name: "development concepts", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "development_concept", expected: []string{"babynyar.gov.ua/development-concept", "babynyar.gov.ua/en/development-concept"}},
		{name: "legal documents", siteURL: "https://babynyar.gov.ua/ignored?query=value", scope: "legal_document", expected: []string{"babynyar.gov.ua/legislative-basis", "babynyar.gov.ua/en/legislative-basis"}},
		{name: "invalid site URL", siteURL: "not-a-url", scope: "gallery", wantErr: true},
		{name: "invalid scope", siteURL: "https://babynyar.gov.ua", scope: "unknown", wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual, err := ScopePrefixes(test.siteURL, test.scope)
			if test.wantErr {
				assert.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, test.expected, actual)
		})
	}
}
