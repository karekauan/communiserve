# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create default admin user
admin = User.find_or_initialize_by(cpf: "11056887982")
if admin.new_record?
  admin.assign_attributes(
    name: "Kauan Costa",
    birthday: Date.parse("2004-03-29"),
    email: "costakauanantonye@gmail.com",
    phone: "45991290579",
    role: "admin",
    password: "admin123" # Default password, should be changed in production
  )
  admin.save!
  
  admin.create_address!(
    street: "Rua Zandvoort",
    number: "95",
    neighborhood: "Interlagos",
    city: "Cascavel",
    state: "Paraná",
    zipcode: "85814330"
  )
  
  puts "Admin user created successfully!"
else
  puts "Admin user already exists."
end

# Create default skills
skills = ['Pintura', 'Elétrica', 'Jardinagem']
skills.each do |skill_name|
  skill = Skill.find_or_create_by(name: skill_name)
  puts "Skill '#{skill_name}' #{skill.persisted? ? 'already exists' : 'created'}"
end
