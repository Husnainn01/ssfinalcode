import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sentry/nextjs", "@opentelemetry/api"],
  output: 'standalone',
  
  // Add images configuration for Cloudinary
  images: {
    domains: [
      'res.cloudinary.com',  // Add Cloudinary domain
      'www.globaldrivemotors.com'
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Configure dynamic routing
  async headers() {
    return [
      {
        source: '/customer-dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  // Updated webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'mongodb-client-encryption': false,
        aws4: false,
        'gcp-metadata': false,
        snappy: false,
        '@mongodb-js/zstd': false,
        kerberos: false,
        socks: false
      };
    }

    // CKEditor configuration
    config.module.rules.push({
      test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
      use: ['raw-loader']
    });

    config.module.rules.push({
      test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
      use: [
        {
          loader: 'style-loader',
          options: {
            injectType: 'singletonStyleTag',
            attributes: {
              'data-cke': true
            }
          }
        },
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                ['postcss-preset-env']
              ]
            }
          }
        }
      ]
    });

    return config;
  },

  env: {
    MONGODB_USER: process.env.MONGODB_USER,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
    MONGODB_HOST: process.env.MONGODB_HOST,
  }
};

const sentryWebpackPluginOptions = {
  hideSourceMaps: true,
  silent: true,
  org: "JDM Global",
  project: "ss-holdings",
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);