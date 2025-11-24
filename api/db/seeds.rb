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
    password: "123456"
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

# ============================================
# MOCKUP DATA - Cascavel-PR, Brazil
# ============================================

# Ensure admin exists for task_requests and tasks
admin = User.find_by(role: 'admin') || User.find_by(cpf: "11056887982")
raise "Admin user not found. Please ensure admin is created first." unless admin

# Create 3 Citizens
puts "\n--- Creating Citizens ---"
citizens_data = [
  {
    cpf: "12345678901",
    name: "Maria Silva",
    birthday: Date.parse("1985-05-15"),
    email: "maria.silva@email.com",
    phone: "45999887766",
    address: {
      street: "Avenida Brasil",
      number: "1234",
      neighborhood: "Centro",
      city: "Cascavel",
      state: "PR",
      zipcode: "85801000"
    }
  },
  {
    cpf: "23456789012",
    name: "João Santos",
    birthday: Date.parse("1990-08-22"),
    email: "joao.santos@email.com",
    phone: "45998765432",
    address: {
      street: "Rua Paraná",
      number: "567",
      neighborhood: "Cascavel Velho",
      city: "Cascavel",
      state: "PR",
      zipcode: "85802000"
    }
  },
  {
    cpf: "34567890123",
    name: "Ana Oliveira",
    birthday: Date.parse("1992-11-10"),
    email: "ana.oliveira@email.com",
    phone: "45997654321",
    address: {
      street: "Rua Mato Grosso",
      number: "890",
      neighborhood: "Pioneiros Catarinenses",
      city: "Cascavel",
      state: "PR",
      zipcode: "85803000"
    }
  }
]

citizens = []
citizens_data.each do |citizen_data|
  citizen = User.find_or_initialize_by(cpf: citizen_data[:cpf])
  if citizen.new_record?
    citizen.assign_attributes(
      name: citizen_data[:name],
      birthday: citizen_data[:birthday],
      email: citizen_data[:email],
      phone: citizen_data[:phone],
      role: "citizen",
      password: "123456"
    )
    citizen.save!
    
    citizen.create_address!(citizen_data[:address])
    puts "Citizen '#{citizen.name}' created"
  else
    puts "Citizen '#{citizen.name}' already exists"
  end
  citizens << citizen
end

# Create 3 Workers
puts "\n--- Creating Workers ---"
workers_data = [
  {
    cpf: "45678901234",
    name: "Carlos Mendes",
    birthday: Date.parse("1988-03-20"),
    email: "carlos.mendes@email.com",
    phone: "45996543210",
    address: {
      street: "Rua São Paulo",
      number: "321",
      neighborhood: "Alto Alegre",
      city: "Cascavel",
      state: "PR",
      zipcode: "85804000"
    },
    skill_names: ['Pintura', 'Elétrica']
  },
  {
    cpf: "56789012345",
    name: "Pedro Alves",
    birthday: Date.parse("1987-07-14"),
    email: "pedro.alves@email.com",
    phone: "45995432109",
    address: {
      street: "Avenida Tito Muffato",
      number: "789",
      neighborhood: "Região do Lago",
      city: "Cascavel",
      state: "PR",
      zipcode: "85805000"
    },
    skill_names: ['Jardinagem', 'Pintura']
  },
  {
    cpf: "67890123456",
    name: "Roberto Lima",
    birthday: Date.parse("1991-12-05"),
    email: "roberto.lima@email.com",
    phone: "45994321098",
    address: {
      street: "Rua Rio de Janeiro",
      number: "456",
      neighborhood: "Brasília",
      city: "Cascavel",
      state: "PR",
      zipcode: "85806000"
    },
    skill_names: ['Elétrica', 'Jardinagem']
  }
]

workers = []
workers_data.each do |worker_data|
  worker = User.find_or_initialize_by(cpf: worker_data[:cpf])
  if worker.new_record?
    worker.assign_attributes(
      name: worker_data[:name],
      birthday: worker_data[:birthday],
      email: worker_data[:email],
      phone: worker_data[:phone],
      role: "worker",
      password: "123456"
    )
    worker.save!
    
    worker.create_address!(worker_data[:address])
    
    # Assign skills
    worker_data[:skill_names].each do |skill_name|
      skill = Skill.find_by(name: skill_name)
      worker.skills << skill if skill && !worker.skills.include?(skill)
    end
    
    puts "Worker '#{worker.name}' created"
  else
    puts "Worker '#{worker.name}' already exists"
  end
  workers << worker
end

# Create 15 Task Requests (varied status)
puts "\n--- Creating Task Requests ---"
task_requests_data = [
  # Pending requests (4)
  {
    name: "Reparo em calçada",
    street: "Avenida Brasil",
    number: "1500",
    neighborhood: "Centro",
    city: "Cascavel",
    state: "PR",
    zipcode: "85801000",
    latitude: -24.9575,
    longitude: -53.4592,
    status: "pending",
    citizen_index: 0
  },
  {
    name: "Poda de árvores",
    street: "Rua Paraná",
    number: "600",
    neighborhood: "Cascavel Velho",
    city: "Cascavel",
    state: "PR",
    zipcode: "85802000",
    latitude: -24.9550,
    longitude: -53.4600,
    status: "pending",
    citizen_index: 1
  },
  {
    name: "Limpeza de bueiro",
    street: "Rua Mato Grosso",
    number: "900",
    neighborhood: "Pioneiros Catarinenses",
    city: "Cascavel",
    state: "PR",
    zipcode: "85803000",
    latitude: -24.9525,
    longitude: -53.4610,
    status: "pending",
    citizen_index: 2
  },
  {
    name: "Reparo em poste de iluminação",
    street: "Avenida Brasil",
    number: "1600",
    neighborhood: "Centro",
    city: "Cascavel",
    state: "PR",
    zipcode: "85801000",
    latitude: -24.9580,
    longitude: -53.4595,
    status: "pending",
    citizen_index: 0
  },
  # Approved requests (7)
  {
    name: "Reparo em rede elétrica",
    street: "Rua São Paulo",
    number: "400",
    neighborhood: "Alto Alegre",
    city: "Cascavel",
    state: "PR",
    zipcode: "85804000",
    latitude: -24.9500,
    longitude: -53.4620,
    status: "approved",
    citizen_index: 0,
    admin_id: admin.id
  },
  {
    name: "Manutenção de jardim público",
    street: "Avenida Tito Muffato",
    number: "850",
    neighborhood: "Região do Lago",
    city: "Cascavel",
    state: "PR",
    zipcode: "85805000",
    latitude: -24.9480,
    longitude: -53.4630,
    status: "approved",
    citizen_index: 1,
    admin_id: admin.id
  },
  {
    name: "Reparo em semáforo",
    street: "Rua Rio de Janeiro",
    number: "500",
    neighborhood: "Brasília",
    city: "Cascavel",
    state: "PR",
    zipcode: "85806000",
    latitude: -24.9460,
    longitude: -53.4640,
    status: "approved",
    citizen_index: 2,
    admin_id: admin.id
  },
  {
    name: "Limpeza de praça",
    street: "Avenida Brasil",
    number: "1700",
    neighborhood: "Centro",
    city: "Cascavel",
    state: "PR",
    zipcode: "85801000",
    latitude: -24.9585,
    longitude: -53.4600,
    status: "approved",
    citizen_index: 0,
    admin_id: admin.id
  },
  {
    name: "Reparo em calçada pública",
    street: "Rua Mato Grosso",
    number: "950",
    neighborhood: "Pioneiros Catarinenses",
    city: "Cascavel",
    state: "PR",
    zipcode: "85803000",
    latitude: -24.9530,
    longitude: -53.4615,
    status: "approved",
    citizen_index: 1,
    admin_id: admin.id
  },
  {
    name: "Pintura de faixa de pedestre",
    street: "Rua Paraná",
    number: "650",
    neighborhood: "Cascavel Velho",
    city: "Cascavel",
    state: "PR",
    zipcode: "85802000",
    latitude: -24.9555,
    longitude: -53.4605,
    status: "approved",
    citizen_index: 2,
    admin_id: admin.id
  },
  {
    name: "Manutenção de calçada",
    street: "Avenida Brasil",
    number: "1900",
    neighborhood: "Centro",
    city: "Cascavel",
    state: "PR",
    zipcode: "85801000",
    latitude: -24.9595,
    longitude: -53.4610,
    status: "approved",
    citizen_index: 0,
    admin_id: admin.id
  },
  # Refused requests (4)
  {
    name: "Construção de quadra esportiva",
    street: "Rua Paraná",
    number: "700",
    neighborhood: "Cascavel Velho",
    city: "Cascavel",
    state: "PR",
    zipcode: "85802000",
    latitude: -24.9560,
    longitude: -53.4610,
    status: "refused",
    citizen_index: 2,
    admin_id: admin.id
  },
  {
    name: "Instalação de playground",
    street: "Avenida Brasil",
    number: "1800",
    neighborhood: "Centro",
    city: "Cascavel",
    state: "PR",
    zipcode: "85801000",
    latitude: -24.9590,
    longitude: -53.4605,
    status: "refused",
    citizen_index: 0,
    admin_id: admin.id
  },
  {
    name: "Construção de ponte",
    street: "Rua São Paulo",
    number: "450",
    neighborhood: "Alto Alegre",
    city: "Cascavel",
    state: "PR",
    zipcode: "85804000",
    latitude: -24.9505,
    longitude: -53.4625,
    status: "refused",
    citizen_index: 1,
    admin_id: admin.id
  },
  {
    name: "Expansão de avenida",
    street: "Avenida Tito Muffato",
    number: "900",
    neighborhood: "Região do Lago",
    city: "Cascavel",
    state: "PR",
    zipcode: "85805000",
    latitude: -24.9485,
    longitude: -53.4635,
    status: "refused",
    citizen_index: 2,
    admin_id: admin.id
  },
  {
    name: "Construção de prédio público",
    street: "Rua Rio de Janeiro",
    number: "550",
    neighborhood: "Brasília",
    city: "Cascavel",
    state: "PR",
    zipcode: "85806000",
    latitude: -24.9465,
    longitude: -53.4645,
    status: "refused",
    citizen_index: 0,
    admin_id: admin.id
  }
]

task_requests = []
task_requests_data.each_with_index do |tr_data, index|
  citizen = citizens[tr_data[:citizen_index]]
  task_request = TaskRequest.find_or_initialize_by(
    name: tr_data[:name],
    citizen_id: citizen.id,
    street: tr_data[:street],
    number: tr_data[:number]
  )
  
  if task_request.new_record?
    task_request.assign_attributes(
      neighborhood: tr_data[:neighborhood],
      city: tr_data[:city],
      state: tr_data[:state],
      zipcode: tr_data[:zipcode],
      latitude: tr_data[:latitude],
      longitude: tr_data[:longitude],
      status: tr_data[:status],
      admin_id: tr_data[:admin_id]
    )
    task_request.save!
    puts "Task Request '#{task_request.name}' (#{task_request.status}) created"
  else
    puts "Task Request '#{task_request.name}' already exists"
  end
  task_requests << task_request
end

# Create 7 Tasks (varied status) - only from approved task_requests
puts "\n--- Creating Tasks ---"
approved_task_requests = task_requests.select { |tr| tr.status == 'approved' }

tasks_data = [
  {
    task_request_index: 0, # First approved task request
    worker_index: 0,
    status: "in_progress",
    initial_date: Date.today - 5,
    limit_end_date: Date.today + 10
  },
  {
    task_request_index: 1,
    worker_index: 1,
    status: "in_progress",
    initial_date: Date.today - 3,
    limit_end_date: Date.today + 12
  },
  {
    task_request_index: 2,
    worker_index: 2,
    status: "approval_requested",
    initial_date: Date.today - 10,
    limit_end_date: Date.today + 5
  },
  {
    task_request_index: 3,
    worker_index: 0,
    status: "approved_conclusion",
    initial_date: Date.today - 15,
    limit_end_date: Date.today - 2
  },
  {
    task_request_index: 4,
    worker_index: 1,
    status: "approved_conclusion",
    initial_date: Date.today - 20,
    limit_end_date: Date.today - 5
  },
  {
    task_request_index: 4,
    worker_index: 1,
    status: "refused_conclusion",
    initial_date: Date.today - 12,
    limit_end_date: Date.today + 3
  },
  {
    task_request_index: 5,
    worker_index: nil, # No worker assigned yet
    status: "in_progress",
    initial_date: Date.today - 1,
    limit_end_date: Date.today + 15
  },
  {
    task_request_index: 6,
    worker_index: 0,
    status: "approval_requested",
    initial_date: Date.today - 8,
    limit_end_date: Date.today + 7
  }
]

tasks_data.each_with_index do |task_data, index|
  task_request = approved_task_requests[task_data[:task_request_index]]
  next unless task_request # Skip if no approved task request available
  
  # Check if task already exists for this task_request (has_one relationship)
  existing_task = Task.find_by(task_request_id: task_request.id)
  if existing_task
    puts "Task for '#{task_request.name}' already exists, skipping"
    next
  end
  
  task = Task.new(
    task_request_id: task_request.id,
    name: task_request.name
  )
  
  worker = task_data[:worker_index] ? workers[task_data[:worker_index]] : nil
  
  task.assign_attributes(
    street: task_request.street,
    number: task_request.number,
    neighborhood: task_request.neighborhood,
    city: task_request.city,
    state: task_request.state,
    zipcode: task_request.zipcode,
    latitude: task_request.latitude,
    longitude: task_request.longitude,
    status: task_data[:status],
    admin_id: admin.id,
    worker_id: worker&.id,
    initial_date: task_data[:initial_date],
    limit_end_date: task_data[:limit_end_date]
  )
  task.save!
  puts "Task '#{task.name}' (#{task.status}) created"
end

puts "\n--- Seed data creation completed! ---"
puts "Created:"
puts "  - 3 Citizens"
puts "  - 3 Workers"
puts "  - 15 Task Requests (4 pending, 7 approved, 4 refused)"
puts "  - 7 Tasks (varied status)"
