package config

import (
	"github.com/caarlos0/env/v11"
)

type options struct {
	required *bool
}

type Option func(options *options) error

func WithRequired(required bool) Option {
	return func(options *options) error {
		options.required = &required
		return nil
	}
}

type Config struct {
	Port int    `env:"API_PORT"`
	Env  string `env:"API_ENV"`
	DB   struct {
		DSN string `env:"DATABASE_URL"`
	}
	Storage struct {
		AccountID       string `env:"STORAGE_ACCOUNT_ID"`
		AccessKeyID     string `env:"STORAGE_ACCESS_KEY_ID"`
		AccessKeySecret string `env:"STORAGE_SECRET_ACCESS_KEY"`
		Bucket          string `env:"STORAGE_BUCKET_NAME"`
		PublicURL       string `env:"STORAGE_PUBLIC_ACCESS_URL"`
	}
	SessionStore struct {
		DSN          string `env:"REDIS_URL"`
		Secret       string `env:"SESSION_SECRET"`
		MaxIdleConns int    `env:"REDIS_MAX_IDLE_CONN" envDefault:"10"`
		Password     string `env:"REDIS_PASSWORD" envDefault:""`
	}
	CORS struct {
		TrustedOrigins []string `env:"CORS_ORIGINS"`
	}
	Cloudflare struct {
		APIToken     string `env:"CLOUDFLARE_API_TOKEN" envDefault:""`
		ZoneID       string `env:"CLOUDFLARE_ZONE_ID" envDefault:""`
		PublicSiteURL string `env:"GOV_PUBLIC_URL" envDefault:"https://babynyar.gov.ua"`
	}
	Seed bool `env:"SEED_USER" envDefault:"false"`
}

func NewConfig(opts ...Option) (Config, error) {
	var options options
	for _, opt := range opts {
		err := opt(&options)
		if err != nil {
			return Config{}, err
		}
	}

	var required bool
	if options.required == nil {
		required = true
	} else {
		required = *options.required
	}

	var cfg Config
	err := env.ParseWithOptions(&cfg, env.Options{
		RequiredIfNoDef: required,
	})
	if err != nil {
		return Config{}, err
	}

	return cfg, nil
}
