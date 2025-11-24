class TaskRequest < ApplicationRecord
  belongs_to :citizen, class_name: 'User'
  belongs_to :admin, class_name: 'User', optional: true
  has_one :task, dependent: :destroy
  
  validates :name, presence: true
  validates :street, presence: true
  validates :number, presence: true
  validates :neighborhood, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :zipcode, presence: true
  validates :status, presence: true, inclusion: { in: %w[pending approved refused] }
end

