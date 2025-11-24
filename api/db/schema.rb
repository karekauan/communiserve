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

ActiveRecord::Schema[8.1].define(version: 2025_11_24_193054) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "addresses", force: :cascade do |t|
    t.string "city", null: false
    t.datetime "created_at", null: false
    t.string "neighborhood", null: false
    t.string "number", null: false
    t.string "state", null: false
    t.string "street", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "zipcode", null: false
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "skills", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_skills_on_name", unique: true
  end

  create_table "task_requests", force: :cascade do |t|
    t.bigint "admin_id"
    t.bigint "citizen_id", null: false
    t.string "city", null: false
    t.datetime "created_at", null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "name", null: false
    t.string "neighborhood", null: false
    t.string "number", null: false
    t.string "state", null: false
    t.string "status", default: "pending", null: false
    t.string "street", null: false
    t.datetime "updated_at", null: false
    t.string "zipcode", null: false
    t.index ["admin_id"], name: "index_task_requests_on_admin_id"
    t.index ["citizen_id"], name: "index_task_requests_on_citizen_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.bigint "admin_id", null: false
    t.string "city", null: false
    t.date "conclusion_date"
    t.datetime "created_at", null: false
    t.date "initial_date"
    t.decimal "latitude", precision: 10, scale: 6
    t.date "limit_end_date"
    t.decimal "longitude", precision: 10, scale: 6
    t.string "name", null: false
    t.string "neighborhood", null: false
    t.string "number", null: false
    t.string "state", null: false
    t.string "status", default: "in_progress", null: false
    t.string "street", null: false
    t.bigint "task_request_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "worker_id"
    t.string "zipcode", null: false
    t.index ["admin_id"], name: "index_tasks_on_admin_id"
    t.index ["task_request_id"], name: "index_tasks_on_task_request_id"
    t.index ["worker_id"], name: "index_tasks_on_worker_id"
  end

  create_table "user_skills", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "skill_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["skill_id"], name: "index_user_skills_on_skill_id"
    t.index ["user_id", "skill_id"], name: "index_user_skills_on_user_id_and_skill_id", unique: true
    t.index ["user_id"], name: "index_user_skills_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.date "birthday", null: false
    t.string "cpf", null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "phone", null: false
    t.string "role", default: "citizen", null: false
    t.datetime "updated_at", null: false
    t.index ["cpf"], name: "index_users_on_cpf", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "task_requests", "users", column: "admin_id"
  add_foreign_key "task_requests", "users", column: "citizen_id"
  add_foreign_key "tasks", "task_requests"
  add_foreign_key "tasks", "users", column: "admin_id"
  add_foreign_key "tasks", "users", column: "worker_id"
  add_foreign_key "user_skills", "skills"
  add_foreign_key "user_skills", "users"
end
