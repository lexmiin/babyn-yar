package storage

import (
	"context"
	"fmt"
	"io"
	"mime"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/transfermanager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/lex-unix/babyn-yar/internal/config"
)

type S3Handler struct {
	client          *s3.Client
	transferManager *transfermanager.Client
	bucket          string
	publicURL       string
}

func NewS3Handler(cfg config.Config) (*S3Handler, error) {
	awsCfg, err := awsConfig.LoadDefaultConfig(context.TODO(),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.Storage.AccessKeyID,
			cfg.Storage.AccessKeySecret,
			"",
		)),
		awsConfig.WithRegion("auto"),
	)

	if err != nil {
		return nil, err
	}

	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.Storage.AccountID)
	client := s3.NewFromConfig(awsCfg, func(options *s3.Options) {
		options.BaseEndpoint = aws.String(r2Endpoint)
	})
	handler := &S3Handler{
		client:    client,
		bucket:    cfg.Storage.Bucket,
		publicURL: cfg.Storage.PublicURL,
	}
	handler.transferManager = transfermanager.New(handler.client)

	return handler, nil

}

// Upload stores body under key. A non-empty filename is the name browsers use
// when saving the object; it is shown inline either way.
func (handler S3Handler) Upload(ctx context.Context, key string, body io.ReadSeeker, contentType, filename string) error {
	input := &transfermanager.UploadObjectInput{
		Body:        body,
		Bucket:      aws.String(handler.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}
	if filename != "" {
		input.ContentDisposition = aws.String(mime.FormatMediaType("inline", map[string]string{"filename": filename}))
	}
	_, err := handler.transferManager.UploadObject(ctx, input)
	return err
}

// URL is the public URL of the object stored under key.
func (handler S3Handler) URL(key string) string {
	return fmt.Sprintf("%s/%s", handler.publicURL, key)
}

// Delete removes the objects stored under keys. Missing objects are not an
// error.
func (handler S3Handler) Delete(ctx context.Context, keys []string) error {
	if len(keys) == 0 {
		return nil
	}
	objects := make([]types.ObjectIdentifier, len(keys))
	for i := range keys {
		objects[i] = types.ObjectIdentifier{Key: aws.String(keys[i])}
	}
	output, err := handler.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(handler.bucket),
		Delete: &types.Delete{
			Objects: objects,
			Quiet:   aws.Bool(true),
		},
	})
	if err != nil {
		return err
	}
	if len(output.Errors) > 0 {
		failed := output.Errors[0]
		return fmt.Errorf("%d objects not deleted, first %q: %s", len(output.Errors), aws.ToString(failed.Key), aws.ToString(failed.Message))
	}
	return nil
}
