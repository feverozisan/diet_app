Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
        origins 'http://localhost:5173', 'http://localhost:3000', 'https://diet-9vlqt0dob-inmu1.vercel.app'

        resource '*',
            headers: :any,
            methods: [:get, :post, :put, :patch, :delete, :options, :head],
            credentials: true
    end
end