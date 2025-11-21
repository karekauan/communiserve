class User < ApplicationRecord
  has_secure_password
  
  has_one :address, dependent: :destroy
  
  validates :name, presence: true
  validates :birthday, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
  validates :cpf, presence: true, uniqueness: true
  validates :role, presence: true, inclusion: { in: %w[admin citizen worker] }
  
  accepts_nested_attributes_for :address
end
