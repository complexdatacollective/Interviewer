// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.0"),
        .package(name: "CapacitorApp", path: "../../../../../node_modules/.pnpm/@capacitor+app@8.1.0_@capacitor+core@8.4.0/node_modules/@capacitor/app"),
        .package(name: "CapacitorBrowser", path: "../../../../../node_modules/.pnpm/@capacitor+browser@8.0.3_@capacitor+core@8.4.0/node_modules/@capacitor/browser"),
        .package(name: "CapacitorDevice", path: "../../../../../node_modules/.pnpm/@capacitor+device@8.0.2_@capacitor+core@8.4.0/node_modules/@capacitor/device"),
        .package(name: "CapacitorFilesystem", path: "../../../../../node_modules/.pnpm/@capacitor+filesystem@8.1.2_@capacitor+core@8.4.0/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorShare", path: "../../../../../node_modules/.pnpm/@capacitor+share@8.0.1_@capacitor+core@8.4.0/node_modules/@capacitor/share"),
        .package(name: "CapawesomeCapacitorFilePicker", path: "../../../../../node_modules/.pnpm/@capawesome+capacitor-file-picker@8.0.2_@capacitor+core@8.4.0/node_modules/@capawesome/capacitor-file-picker")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorBrowser", package: "CapacitorBrowser"),
                .product(name: "CapacitorDevice", package: "CapacitorDevice"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapawesomeCapacitorFilePicker", package: "CapawesomeCapacitorFilePicker")
            ]
        )
    ]
)
