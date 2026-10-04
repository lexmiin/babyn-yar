{
  description = "A Nix-flake-based development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    go-overlay.url = "github:purpleclay/go-overlay";
    flake-utils.url = "github:numtide/flake-utils";
    fnox.url = "github:lexmiin/fnox-nix";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    go-overlay,
    fnox,
  }:
    {
      overlays.default = final: prev: {
        go = final.go-bin.versions."1.27.0";
        nodejs = final.nodejs_24;
      };
    }
    // (flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            go-overlay.overlays.default
            self.overlays.default
            fnox.overlays.default
          ];
        };

        # Avoid the Snowflake driver panic in Nixpkgs' broad go-migrate build.
        # https://github.com/golang-migrate/migrate/issues/1279
        go-migrate-pg = pkgs.go-migrate.overrideAttrs (_oldAttrs: {
          tags = ["postgres"];
        });

        # Staticcheck cannot analyze code targeting a newer Go version than its build toolchain.
        gotools = pkgs.go-tools.override {
          buildGoModule = pkgs.buildGoModule.override {go = pkgs.go;};
        };

        # Keep CI's closure small; development tools extend the same toolchain.
        ciTools = [
          pkgs.go
          pkgs.nodejs
          pkgs.pnpm_11
          pkgs.just
          pkgs.git
        ];

        devTools = [
          pkgs.air
          go-migrate-pg
          gotools
          pkgs.govulncheck
          pkgs.rclone
          pkgs.jq
          pkgs.actionlint
          pkgs.fnox
          pkgs.curl
        ];
      in {
        formatter = pkgs.alejandra;

        devShells = {
          ci = pkgs.mkShell {
            packages = ciTools;
          };

          default = pkgs.mkShell {
            packages = ciTools ++ devTools;
          };
        };
      }
    ));
}
