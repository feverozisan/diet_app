Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # 開発環境に加え、Vercelの本番URL（またはプレビューURL）を許可する
        origins 'http://localhost:5173', 'http://localhost:3000', 'https://diet-app-1-o39l.onrender.com', 'https://diet-g5x2r8ncx-inmu1.vercel.app'

        resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
end