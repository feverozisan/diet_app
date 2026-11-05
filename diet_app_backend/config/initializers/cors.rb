# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # VercelのフロントエンドURL、または開発用に '*'（すべて許可）を指定
        origins 'https://diet-app-frontend-new.vercel.app'

        resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
end