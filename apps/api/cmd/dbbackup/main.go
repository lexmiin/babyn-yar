package main

import (
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path"
	"time"

	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/storage"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	log.Println("reading config file")
	cfg, err := config.NewConfig(config.WithRequired(false))
	if err != nil {
		return err
	}
	handler, err := storage.NewS3Handler(cfg)
	if err != nil {
		return err
	}

	timestamp := time.Now().Format("2006-01-02_15_04_05")
	filename := fmt.Sprintf("dump_%s.gz", timestamp)
	filepath := path.Join(os.TempDir(), filename)

	log.Println("dumping database")
	if err := dumpDatabase(filepath); err != nil {
		return fmt.Errorf("failed to dump database: %v", err)
	}

	defer func() {
		if err := os.Remove(filepath); err != nil {
			log.Printf("failed to remove temporary file: %v", err)
		}
	}()

	log.Println("uploading to remote storage")
	if err := uploadFile(handler, filepath, filename); err != nil {
		return fmt.Errorf("failed to upload file: %v", err)
	}

	log.Println("upload successful")
	return nil
}

func dumpDatabase(filepath string) error {
	cmd := exec.Command("sh", "-c", "docker exec babyn-yar-db-1 pg_dumpall -c -U postgres")

	file, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}

	defer file.Close()

	gzipWriter := gzip.NewWriter(file)
	defer gzipWriter.Close()

	cmd.Stdout = gzipWriter

	var stderr io.ReadCloser
	if stderr, err = cmd.StderrPipe(); err != nil {
		return fmt.Errorf("failed to stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %v", err)
	}

	go func() {
		io.Copy(os.Stderr, stderr)
	}()

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("command failed: %v", err)
	}

	return nil

}

func uploadFile(handler *storage.S3Handler, filepath, filename string) error {
	file, err := os.Open(filepath)
	if err != nil {
		return err
	}
	defer file.Close()

	return handler.Upload(context.Background(), filename, file, "application/gzip", filename)
}
