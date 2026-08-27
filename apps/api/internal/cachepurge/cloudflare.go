package cachepurge

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	cloudflareAPIBaseURL  = "https://api.cloudflare.com/client/v4"
	cloudflareHTTPTimeout = 10 * time.Second
)

type CloudflareClient struct {
	apiBaseURL string
	apiToken   string
	zoneID     string
	httpClient *http.Client
}

type purgePrefixesRequest struct {
	Prefixes []string `json:"prefixes"`
}

type cloudflareError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type cloudflareResponse struct {
	Success bool              `json:"success"`
	Errors  []cloudflareError `json:"errors"`
}

func NewCloudflareClient(apiToken string, zoneID string) (*CloudflareClient, error) {
	return newCloudflareClient(apiToken, zoneID, &http.Client{Timeout: cloudflareHTTPTimeout})
}

func newCloudflareClient(apiToken string, zoneID string, httpClient *http.Client) (*CloudflareClient, error) {
	if strings.TrimSpace(apiToken) == "" {
		return nil, errors.New("cloudflare API token is required")
	}
	if strings.TrimSpace(zoneID) == "" {
		return nil, errors.New("cloudflare zone ID is required")
	}

	return &CloudflareClient{
		apiBaseURL: cloudflareAPIBaseURL,
		apiToken:   apiToken,
		zoneID:     zoneID,
		httpClient: httpClient,
	}, nil
}

func (client *CloudflareClient) PurgePrefixes(ctx context.Context, prefixes []string) error {
	if len(prefixes) == 0 {
		return nil
	}

	body, err := json.Marshal(purgePrefixesRequest{Prefixes: prefixes})
	if err != nil {
		return err
	}

	endpoint := fmt.Sprintf("%s/zones/%s/purge_cache", strings.TrimRight(client.apiBaseURL, "/"), url.PathEscape(client.zoneID))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+client.apiToken)
	req.Header.Set("Content-Type", "application/json")

	response, err := client.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	var result cloudflareResponse
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&result); err != nil {
		return fmt.Errorf("decode Cloudflare purge response (status %d): %w", response.StatusCode, err)
	}
	if !result.Success {
		if len(result.Errors) > 0 {
			return fmt.Errorf("Cloudflare purge failed (status %d, code %d): %s", response.StatusCode, result.Errors[0].Code, result.Errors[0].Message)
		}
		return fmt.Errorf("Cloudflare purge failed with status %d", response.StatusCode)
	}

	return nil
}
