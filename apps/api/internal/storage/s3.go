package storage

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/lex-unix/babyn-yar/internal/config"
)

type S3Handler struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

func NewS3Handler(cfg config.Config) (*S3Handler, error) {
	r2Resovler := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.Storage.AccountID),
		}, nil
	})

	awsCfg, err := awsConfig.LoadDefaultConfig(context.TODO(),
		awsConfig.WithEndpointResolverWithOptions(r2Resovler),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.Storage.AccessKeyID,
			cfg.Storage.AccessKeySecret,
			"",
		)),
	)

	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg)
	S3Handler := &S3Handler{
		client:    client,
		bucket:    cfg.Storage.Bucket,
		publicURL: cfg.Storage.PublicURL,
	}
	return S3Handler, nil

}

func (handler S3Handler) Upload(file io.ReadSeeker, filename, contentType string) (string, error) {
	uploader := manager.NewUploader(handler.client)

	_, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Body:        file,
		Bucket:      aws.String(handler.bucket),
		Key:         aws.String(filename),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}
	url := fmt.Sprintf("%s/%s", handler.publicURL, filename)
	return url, nil
}

func (handler S3Handler) Delete(keys []*string) error {
	var objects []types.ObjectIdentifier
	for _, key := range keys {
		objects = append(objects, types.ObjectIdentifier{
			Key: key,
		})
	}
	_, err := handler.client.DeleteObjects(context.TODO(), &s3.DeleteObjectsInput{
		Bucket: aws.String(handler.bucket),
		Delete: &types.Delete{
			Objects: objects,
			Quiet:   aws.Bool(true),
		},
	})
	if err != nil {
		return err
	}

	return nil
}

func (handler S3Handler) Exists(key string) (bool, error) {
	_, err := handler.client.HeadObject(context.TODO(), &s3.HeadObjectInput{
		Bucket: aws.String(handler.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		var notFoundErr *types.NotFound
		if errors.As(err, &notFoundErr) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}
