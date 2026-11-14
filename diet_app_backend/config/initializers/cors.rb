Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # localhostに加え、*.vercel.app のサブドメインをすべて許可する
        origins 'http://localhost:5173', 'http://localhost:3000', /\.vercel\.app\z/

        resource '*',
            headers: :any,
            methods: [:get, :post, :put, :patch, :delete, :options, :head],
            credentials: true
    end
end