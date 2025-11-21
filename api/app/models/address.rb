class Address < ApplicationRecord
  belongs_to :user
  
  validates :street, presence: true
  validates :number, presence: true
  validates :neighborhood, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :zipcode, presence: true
end
