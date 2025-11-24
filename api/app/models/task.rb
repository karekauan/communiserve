class Task < ApplicationRecord
  belongs_to :task_request
  belongs_to :worker, class_name: 'User', optional: true
  belongs_to :admin, class_name: 'User'
  
  validates :name, presence: true
  validates :street, presence: true
  validates :number, presence: true
  validates :neighborhood, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :zipcode, presence: true
  validates :status, presence: true, inclusion: { in: %w[in_progress approval_requested approved_conclusion refused_conclusion] }
end

