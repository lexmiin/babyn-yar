package cachepurge

import (
	"fmt"
	"net/url"
)

var scopePaths = map[string]string{
	"gallery":             "gallery",
	"event":               "events",
	"book":                "education/library",
	"holocaust_document":  "holocaust/documents",
	"victim_testimony":    "holocaust/testimonies",
	"media_article":       "media-articles",
	"partner":             "partners",
	"development_concept": "development-concept",
	"legal_document":      "legislative-basis",
}

func ScopePrefixes(siteURL string, scope string) ([]string, error) {
	base, err := url.Parse(siteURL)
	if err != nil || (base.Scheme != "http" && base.Scheme != "https") || base.Host == "" {
		return nil, fmt.Errorf("invalid public site URL %q", siteURL)
	}

	scopePath, ok := scopePaths[scope]
	if !ok {
		return nil, fmt.Errorf("unsupported cache purge scope %q", scope)
	}

	return []string{
		base.Host + "/" + scopePath,
		base.Host + "/en/" + scopePath,
	}, nil
}
