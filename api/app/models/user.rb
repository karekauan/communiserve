class User < ApplicationRecord
  has_secure_password
  
  has_one :address, dependent: :destroy
  has_many :user_skills, dependent: :destroy
  has_many :skills, through: :user_skills
  
  # Task requests created by citizen
  has_many :task_requests, foreign_key: 'citizen_id', dependent: :destroy
  
  # Tasks assigned to worker
  has_many :tasks, foreign_key: 'worker_id', dependent: :nullify
  
  # Task requests approved/refused by admin
  has_many :approved_task_requests, class_name: 'TaskRequest', foreign_key: 'admin_id', dependent: :nullify
  
  # Tasks created/managed by admin
  has_many :managed_tasks, class_name: 'Task', foreign_key: 'admin_id', dependent: :nullify
  
  validates :name, presence: true
  validates :birthday, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
  validates :cpf, presence: true, uniqueness: true
  validates :role, presence: true, inclusion: { in: %w[admin citizen worker] }
  
  accepts_nested_attributes_for :address
end
