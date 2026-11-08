# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_03_130821) do
  create_table "daily_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date"
    t.decimal "fat_percentage", precision: 10
    t.text "memo"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.decimal "weight", precision: 10
    t.index ["user_id"], name: "index_daily_records_on_user_id"
  end

  create_table "goals", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "memo"
    t.decimal "target_weight", precision: 10
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_goals_on_user_id"
  end

  create_table "meal_logs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "calories"
    t.float "carbs"
    t.datetime "created_at", null: false
    t.float "fat"
    t.string "meal_type"
    t.string "name"
    t.float "protein"
    t.date "recorded_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_meal_logs_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "activity_level"
    t.integer "age"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "gender"
    t.decimal "height", precision: 10
    t.string "password_digest"
    t.decimal "target_weight", precision: 10
    t.datetime "updated_at", null: false
  end

  create_table "weight_logs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "memo"
    t.date "recorded_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.decimal "weight", precision: 5, scale: 2
    t.index ["user_id"], name: "index_weight_logs_on_user_id"
  end

  create_table "weights", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "recorded_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.decimal "weight", precision: 10
    t.index ["user_id"], name: "index_weights_on_user_id"
  end

  add_foreign_key "daily_records", "users"
  add_foreign_key "goals", "users"
  add_foreign_key "meal_logs", "users"
  add_foreign_key "weight_logs", "users"
  add_foreign_key "weights", "users"
end
