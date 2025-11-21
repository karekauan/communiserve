class AuthController < ApplicationController
  # Check if CPF exists
  def check_cpf
    user = User.find_by(cpf: params[:cpf])
    
    if user
      render json: { exists: true }
    else
      render json: { exists: false }
    end
  end
  
  # Login with CPF and password
  def login
    user = User.find_by(cpf: params[:cpf])
    
    if user && user.authenticate(params[:password])
      render json: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cpf: user.cpf
        },
        message: "Login realizado com sucesso"
      }, status: :ok
    else
      render json: { error: "CPF ou senha inválidos" }, status: :unauthorized
    end
  end
  
  # Register new user (citizen by default)
  def register
    user = User.new(user_params)
    user.role = "citizen"
    user.password = params[:password]
    
    if user.save
      render json: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cpf: user.cpf
        },
        message: "Usuário criado com sucesso"
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private
  
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

