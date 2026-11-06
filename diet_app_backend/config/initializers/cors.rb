# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # 一時的にすべてのアクセスを許可してテスト
        origins '*'

        resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: false # '*' にする場合は false にする必要があります
    end
end