Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        # 現在使っているVercelのURLを追加する
        origins 'http://localhost:5173', 'http://localhost:3000', 'https://diet-a14r5jos4-inmu1.vercel.app'

        resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
end