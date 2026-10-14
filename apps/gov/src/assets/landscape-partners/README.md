Partner logos from the [supplied Drive folder](https://drive.google.com/drive/folders/19uTIUzKVh4VfQMd97ikW0pxu8OKSVJ5n):

- `remember-us.jpg`: original `06.05.2022, 15_13_54.jpg`.
- `franko-theatre.svg`: black Ukrainian `logo_text-02.svg`, with the viewBox tightened around the artwork.
- `german-embassy.pdf`: original `Kiew_ukra_c (1).pdf`.
- `german-embassy.svg`: generated from the retained PDF using Poppler. Regenerate from the repository root:

  ```sh
  pdftocairo -svg apps/gov/src/assets/landscape-partners/german-embassy.pdf apps/gov/src/assets/landscape-partners/german-embassy.svg
  ```

The Babyn Yar logo reuses `../logo.webp`.
