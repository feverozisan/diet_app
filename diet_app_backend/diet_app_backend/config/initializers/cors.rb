Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # フロントエンド（Vite / React）のアクセス元URLを明記します
        # ※開発環境のポート(5173等)や本番環境のフロントURLを指定してください
        origins 'http://localhost:5173', 'http://localhost:3000'

        # もしAWSや別IPからフロントを開いている場合は、そのIP/ドメインも追加します
        # origins 'http://14.8.8.194:5173', 'http://localhost:5173'

        resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true # 特定の origins を指定しているため true にできます
    end
end