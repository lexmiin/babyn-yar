{
  description = "A Nix-flake-based development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    go-overlay.url = "github:purpleclay/go-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    go-overlay,
  }:
    {
      overlays.default = final: prev: {
        go = final.go-bin.versions."1.26.5";
        nodejs = final.nodejs_22;
      };
    }
    // (flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            go-overlay.overlays.default
            self.overlays.default
          ];
        };

        # Avoid the Snowflake driver panic in Nixpkgs' broad go-migrate build.
        # https://github.com/golang-migrate/migrate/issues/1279
        go-migrate-pg = pkgs.go-migrate.overrideAttrs (_oldAttrs: {
          tags = ["postgres"];
        });
      in {
        formatter = pkgs.alejandra;

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.go
            pkgs.nodejs
            pkgs.air
            go-migrate-pg
            pkgs.go-tools
            pkgs.govulncheck
            pkgs.just
            pkgs.rclone
            pkgs.jq
            pkgs.pnpm_11
            pkgs.actionlint
          ];
        };
      }
    ));
}
