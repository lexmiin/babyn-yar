{buildGoModule}:
buildGoModule {
  pname = "babyn-yar-api";
  version = "0.0.1";

  src = ./.;

  proxyVendor = true;
  vendorHash = "sha256-6eey1i8pLD9o+dTQORFFDSFgzL8N8lkTydLWUc7AuyE=";

  subPackages = ["cmd/api"];

  ldflags = [
    "-s"
    "-w"
  ];

  # Integration tests require a Docker-provided PostgreSQL container and run in CI.
  doCheck = false;

  env.CGO_ENABLED = 0;
}
