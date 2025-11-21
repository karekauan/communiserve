class UsersController < ApplicationController
  before_action :authenticate_admin, except: []
  
  # List all users with role citizen or worker
  def index
    users = User.where(role: ['citizen', 'worker'])
                .includes(:address, :skills)
                .order(:name)
    
    render json: users.map { |user|
      {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday
      }
    }
  end
  
  # Show user details
  def show
    user = User.find(params[:id])
    
    render json: {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      address: user.address ? {
        street: user.address.street,
        number: user.address.number,
        neighborhood: user.address.neighborhood,
        city: user.address.city,
        state: user.address.state,
        zipcode: user.address.zipcode
      } : nil,
      skills: user.skills.map { |skill| { id: skill.id, name: skill.name } }
    }
  end
  
  # Update worker (only workers can be updated)
  def update
    user = User.find(params[:id])
    
    unless user.role == 'worker'
      render json: { error: 'Only workers can be updated' }, status: :unprocessable_entity
      return
    end
    
    # Reload user to get fresh associations
    user.reload
    
    if user.update(user_params)
      # Update skills if provided
      if params[:skill_ids].present?
        user.skill_ids = params[:skill_ids]
      end
      
      # Reload to get updated skills
      user.reload
      
      render json: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        address: user.address ? {
          street: user.address.street,
          number: user.address.number,
          neighborhood: user.address.neighborhood,
          city: user.address.city,
          state: user.address.state,
          zipcode: user.address.zipcode
        } : nil,
        skills: user.skills.map { |skill| { id: skill.id, name: skill.name } }
      }
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # Create new worker
  def create_worker
    user = User.new(user_params)
    user.role = 'worker'
    user.password = params[:password] || SecureRandom.hex(8) # Generate random password if not provided
    
    if user.save
      # Assign skills if provided
      if params[:skill_ids].present?
        user.skill_ids = params[:skill_ids]
      end
      
      render json: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        address: user.address ? {
          street: user.address.street,
          number: user.address.number,
          neighborhood: user.address.neighborhood,
          city: user.address.city,
          state: user.address.state,
          zipcode: user.address.zipcode
        } : nil,
        skills: user.skills.map { |skill| { id: skill.id, name: skill.name } }
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # Get all available skills
  def skills
    skills = Skill.all.order(:name)
    render json: skills.map { |skill| { id: skill.id, name: skill.name } }
  end
  
  private
  
  def authenticate_admin
    # For now, we'll skip authentication - in production, add proper auth
    # This should check if the current user is an admin
  end
  
  def user_params
    params.require(:user).permit(
      :name,
      :birthday,
      :email,
      :phone,
      :cpf,
      address_attributes: [
        :street,
        :number,
        :neighborhood,
        :city,
        :state,
        :zipcode
      ]
    )
  end
end
