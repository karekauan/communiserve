class TasksController < ApplicationController
  # Get dashboard data based on user role
  def dashboard
    user = User.find_by(cpf: params[:cpf])
    
    unless user
      render json: { error: 'User not found' }, status: :not_found
      return
    end
    
    case user.role
    when 'citizen'
      render_citizen_dashboard(user)
    when 'worker'
      render_worker_dashboard(user)
    when 'admin'
      render_admin_dashboard(user)
    else
      render json: { error: 'Invalid role' }, status: :unprocessable_entity
    end
  end
  
  # Get map data (task_requests and tasks) based on user role
  def map_data
    user = User.find_by(cpf: params[:cpf])
    
    unless user
      render json: { error: 'User not found' }, status: :not_found
      return
    end
    
    case user.role
    when 'citizen'
      render_citizen_map_data(user)
    when 'worker'
      render_worker_map_data(user)
    when 'admin'
      render_admin_map_data(user, params[:filter])
    else
      render json: { error: 'Invalid role' }, status: :unprocessable_entity
    end
  end
  
  # Create new task_request (citizen only)
  def create_task_request
    user = User.find_by(cpf: params[:cpf])
    
    unless user && user.role == 'citizen'
      render json: { error: 'Only citizens can create task requests' }, status: :unauthorized
      return
    end
    
    task_request = TaskRequest.new(task_request_params)
    task_request.citizen = user
    task_request.status = 'pending'
    
    if task_request.save
      render json: format_task_request(task_request)
    else
      render json: { errors: task_request.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # Get task_request or task details
  def show
    if params[:type] == 'task_request'
      item = TaskRequest.find(params[:id])
      render json: format_task_request(item, true)
    elsif params[:type] == 'task'
      item = Task.find(params[:id])
      render json: format_task(item, true)
    else
      render json: { error: 'Invalid type' }, status: :unprocessable_entity
    end
  end
  
  # Update task status (worker actions)
  def update_task_status
    user = User.find_by(cpf: params[:cpf])
    task = Task.find(params[:id])
    
    unless user && user.role == 'worker' && task.worker_id == user.id
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
    
    new_status = params[:status]
    unless %w[in_progress approval_requested].include?(new_status)
      render json: { error: 'Invalid status' }, status: :unprocessable_entity
      return
    end
    
    if new_status == 'in_progress' && task.initial_date.nil?
      # Set initial_date when starting (only if not already set)
      task.initial_date = Date.today
    end
    
    task.status = new_status
    
    if task.save
      render json: format_task(task, true)
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # Admin actions: approve/refuse task_request or task
  def admin_action
    user = User.find_by(cpf: params[:cpf])
    
    unless user && user.role == 'admin'
      render json: { error: 'Only admins can perform this action' }, status: :unauthorized
      return
    end
    
    action = params[:action_type] # 'approve_task_request', 'refuse_task_request', 'approve_task', 'refuse_task'
    item_id = params[:id]
    
    case action
    when 'approve_task_request'
      handle_approve_task_request(user, item_id, params[:worker_id])
    when 'refuse_task_request'
      handle_refuse_task_request(user, item_id)
    when 'approve_task'
      handle_approve_task(user, item_id)
    when 'refuse_task'
      handle_refuse_task(user, item_id)
    else
      render json: { error: 'Invalid action' }, status: :unprocessable_entity
    end
  end
  
  private
  
  def render_citizen_dashboard(user)
    task_requests = user.task_requests
    total_requests = task_requests.count
    approved_requests = task_requests.where(status: 'approved')
    total_approved = approved_requests.count
    
    # Get approved task requests with their corresponding tasks (initial and end dates)
    approved_list = approved_requests.includes(:task).map do |tr|
      task = tr.task
      {
        id: tr.id,
        name: tr.name,
        status: tr.status,
        initial_date: task&.initial_date,
        end_date: task&.limit_end_date,
        address: {
          street: tr.street,
          number: tr.number,
          neighborhood: tr.neighborhood,
          city: tr.city,
          state: tr.state,
          zipcode: tr.zipcode
        }
      }
    end
    
    render json: {
      total_task_requests: total_requests,
      total_approved: total_approved,
      approved_list: approved_list
    }
  end
  
  def render_worker_dashboard(user)
    tasks = user.tasks
    approval_requested_tasks = tasks.where(status: 'approval_requested')
    approved_conclusion_tasks = tasks.where(status: 'approved_conclusion')
    in_progress_tasks = tasks.where(status: 'in_progress').where.not(initial_date: nil)
    
    total_approval_requested = approval_requested_tasks.count
    total_approved_conclusion = approved_conclusion_tasks.count
    total_in_progress = in_progress_tasks.count
    
    # Get attached tasks with local and limit end date
    # Include: in_progress tasks that have been started (have initial_date), approval_requested, and approved_conclusion
    attached_tasks = tasks.where(
      "(status = 'in_progress' AND initial_date IS NOT NULL) OR status IN (?)",
      ['approval_requested', 'approved_conclusion']
    ).map do |task|
      {
        id: task.id,
        name: task.name,
        status: task.status,
        local: "#{task.street}, #{task.number} - #{task.neighborhood}, #{task.city} - #{task.state}",
        limit_end_date: task.limit_end_date,
        address: {
          street: task.street,
          number: task.number,
          neighborhood: task.neighborhood,
          city: task.city,
          state: task.state,
          zipcode: task.zipcode
        }
      }
    end
    
    render json: {
      total_approval_requested: total_approval_requested,
      total_approved_conclusion: total_approved_conclusion,
      total_in_progress: total_in_progress,
      attached_tasks: attached_tasks
    }
  end
  
  def render_admin_dashboard(user)
    # Total task requests
    total_task_requests = TaskRequest.count
    
    # Tasks with status approval_requested that have been validated (approved or refused)
    validated_tasks = Task.where(status: ['approved_conclusion', 'refused_conclusion']).count
    
    # Pending task requests (status: pending)
    pending_task_requests = TaskRequest.where(status: 'pending').includes(:citizen).map do |tr|
      {
        id: tr.id,
        name: tr.name,
        status: tr.status,
        citizen_name: tr.citizen.name,
        created_at: tr.created_at,
        address: {
          street: tr.street,
          number: tr.number,
          neighborhood: tr.neighborhood,
          city: tr.city,
          state: tr.state,
          zipcode: tr.zipcode
        }
      }
    end
    
    # Pending tasks with status approval_requested
    pending_tasks = Task.where(status: 'approval_requested').includes(:worker, :task_request).map do |task|
      {
        id: task.id,
        name: task.name,
        status: task.status,
        worker_name: task.worker&.name,
        limit_end_date: task.limit_end_date,
        address: {
          street: task.street,
          number: task.number,
          neighborhood: task.neighborhood,
          city: task.city,
          state: task.state,
          zipcode: task.zipcode
        }
      }
    end
    
    render json: {
      total_task_requests: total_task_requests,
      total_validated_tasks: validated_tasks,
      pending_task_requests: pending_task_requests,
      pending_tasks: pending_tasks
    }
  end
  
  def render_citizen_map_data(user)
    # Get user's task_requests and their approved tasks
    task_requests = user.task_requests.includes(:task)
    
    pins = []
    
    task_requests.each do |tr|
      pins << {
        id: tr.id,
        type: 'task_request',
        name: tr.name,
        status: tr.status,
        latitude: tr.latitude.to_f,
        longitude: tr.longitude.to_f,
        address: {
          street: tr.street,
          number: tr.number,
          neighborhood: tr.neighborhood,
          city: tr.city,
          state: tr.state,
          zipcode: tr.zipcode
        }
      }
      
      # Add task if approved
      if tr.task
        pins << {
          id: tr.task.id,
          type: 'task',
          name: tr.task.name,
          status: tr.task.status,
          latitude: tr.task.latitude.to_f,
          longitude: tr.task.longitude.to_f,
          address: {
            street: tr.task.street,
            number: tr.task.number,
            neighborhood: tr.task.neighborhood,
            city: tr.task.city,
            state: tr.task.state,
            zipcode: tr.task.zipcode
          }
        }
      end
    end
    
    render json: { pins: pins }
  end
  
  def render_worker_map_data(user)
    # Get tasks attached to worker
    tasks = user.tasks
    
    pins = tasks.map do |task|
      {
        id: task.id,
        type: 'task',
        name: task.name,
        status: task.status,
        latitude: task.latitude.to_f,
        longitude: task.longitude.to_f,
        address: {
          street: task.street,
          number: task.number,
          neighborhood: task.neighborhood,
          city: task.city,
          state: task.state,
          zipcode: task.zipcode
        }
      }
    end
    
    render json: { pins: pins }
  end
  
  def render_admin_map_data(user, filter = nil)
    pins = []
    
    # Task requests pending approval/refusal
    if filter.nil? || filter.include?('pending_task_requests')
      TaskRequest.where(status: 'pending').each do |tr|
        pins << {
          id: tr.id,
          type: 'task_request',
          category: 'pending_task_requests',
          name: tr.name,
          status: tr.status,
          latitude: tr.latitude.to_f,
          longitude: tr.longitude.to_f,
          address: {
            street: tr.street,
            number: tr.number,
            neighborhood: tr.neighborhood,
            city: tr.city,
            state: tr.state,
            zipcode: tr.zipcode
          }
        }
      end
    end
    
    # Tasks without worker
    if filter.nil? || filter.include?('tasks_without_worker')
      Task.where(worker_id: nil).each do |task|
        pins << {
          id: task.id,
          type: 'task',
          category: 'tasks_without_worker',
          name: task.name,
          status: task.status,
          latitude: task.latitude.to_f,
          longitude: task.longitude.to_f,
          address: {
            street: task.street,
            number: task.number,
            neighborhood: task.neighborhood,
            city: task.city,
            state: task.state,
            zipcode: task.zipcode
          }
        }
      end
    end
    
    # Tasks not started by worker
    if filter.nil? || filter.include?('tasks_not_started')
      Task.where.not(worker_id: nil).where(status: 'in_progress', initial_date: nil).each do |task|
        pins << {
          id: task.id,
          type: 'task',
          category: 'tasks_not_started',
          name: task.name,
          status: task.status,
          latitude: task.latitude.to_f,
          longitude: task.longitude.to_f,
          address: {
            street: task.street,
            number: task.number,
            neighborhood: task.neighborhood,
            city: task.city,
            state: task.state,
            zipcode: task.zipcode
          }
        }
      end
    end
    
    # Tasks pending approval/refusal
    if filter.nil? || filter.include?('tasks_pending_approval')
      Task.where(status: 'approval_requested').each do |task|
        pins << {
          id: task.id,
          type: 'task',
          category: 'tasks_pending_approval',
          name: task.name,
          status: task.status,
          latitude: task.latitude.to_f,
          longitude: task.longitude.to_f,
          address: {
            street: task.street,
            number: task.number,
            neighborhood: task.neighborhood,
            city: task.city,
            state: task.state,
            zipcode: task.zipcode
          }
        }
      end
    end
    
    # Tasks refused
    if filter.nil? || filter.include?('tasks_refused')
      Task.where(status: 'refused_conclusion').each do |task|
        pins << {
          id: task.id,
          type: 'task',
          category: 'tasks_refused',
          name: task.name,
          status: task.status,
          latitude: task.latitude.to_f,
          longitude: task.longitude.to_f,
          address: {
            street: task.street,
            number: task.number,
            neighborhood: task.neighborhood,
            city: task.city,
            state: task.state,
            zipcode: task.zipcode
          }
        }
      end
    end
    
    # Tasks concluded (only if filter includes it)
    if filter && filter.include?('tasks_concluded')
      Task.where(status: 'approved_conclusion').each do |task|
        pins << {
          id: task.id,
          type: 'task',
          category: 'tasks_concluded',
          name: task.name,
          status: task.status,
          latitude: task.latitude.to_f,
          longitude: task.longitude.to_f,
          address: {
            street: task.street,
            number: task.number,
            neighborhood: task.neighborhood,
            city: task.city,
            state: task.state,
            zipcode: task.zipcode
          }
        }
      end
    end
    
    render json: { pins: pins }
  end
  
  def handle_approve_task_request(admin, task_request_id, worker_id)
    task_request = TaskRequest.find(task_request_id)
    
    unless task_request.status == 'pending'
      render json: { error: 'Task request already processed' }, status: :unprocessable_entity
      return
    end
    
    task_request.status = 'approved'
    task_request.admin = admin
    
    if task_request.save
      # Create task from approved task_request
      task = Task.new(
        task_request: task_request,
        name: task_request.name,
        street: task_request.street,
        number: task_request.number,
        neighborhood: task_request.neighborhood,
        city: task_request.city,
        state: task_request.state,
        zipcode: task_request.zipcode,
        latitude: task_request.latitude,
        longitude: task_request.longitude,
        admin: admin,
        worker_id: worker_id,
        status: 'in_progress'
      )
      
      if task.save
        render json: {
          task_request: format_task_request(task_request, true),
          task: format_task(task, true)
        }
      else
        render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { errors: task_request.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def handle_refuse_task_request(admin, task_request_id)
    task_request = TaskRequest.find(task_request_id)
    
    unless task_request.status == 'pending'
      render json: { error: 'Task request already processed' }, status: :unprocessable_entity
      return
    end
    
    task_request.status = 'refused'
    task_request.admin = admin
    
    if task_request.save
      render json: format_task_request(task_request, true)
    else
      render json: { errors: task_request.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def handle_approve_task(admin, task_id)
    task = Task.find(task_id)
    
    unless task.status == 'approval_requested'
      render json: { error: 'Task is not awaiting approval' }, status: :unprocessable_entity
      return
    end
    
    task.status = 'approved_conclusion'
    task.conclusion_date = Date.today
    
    if task.save
      render json: format_task(task, true)
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def handle_refuse_task(admin, task_id)
    task = Task.find(task_id)
    
    unless task.status == 'approval_requested'
      render json: { error: 'Task is not awaiting approval' }, status: :unprocessable_entity
      return
    end
    
    task.status = 'refused_conclusion'
    
    if task.save
      render json: format_task(task, true)
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def format_task_request(tr, detailed = false)
    data = {
      id: tr.id,
      type: 'task_request',
      name: tr.name,
      status: tr.status,
      latitude: tr.latitude.to_f,
      longitude: tr.longitude.to_f,
      address: {
        street: tr.street,
        number: tr.number,
        neighborhood: tr.neighborhood,
        city: tr.city,
        state: tr.state,
        zipcode: tr.zipcode
      }
    }
    
    if detailed
      data[:citizen] = {
        id: tr.citizen.id,
        name: tr.citizen.name,
        cpf: tr.citizen.cpf
      }
      data[:admin] = tr.admin ? {
        id: tr.admin.id,
        name: tr.admin.name
      } : nil
      data[:created_at] = tr.created_at
      data[:task] = tr.task ? format_task(tr.task, false) : nil
    end
    
    data
  end
  
  def format_task(task, detailed = false)
    data = {
      id: task.id,
      type: 'task',
      name: task.name,
      status: task.status,
      latitude: task.latitude.to_f,
      longitude: task.longitude.to_f,
      initial_date: task.initial_date,
      limit_end_date: task.limit_end_date,
      conclusion_date: task.conclusion_date,
      address: {
        street: task.street,
        number: task.number,
        neighborhood: task.neighborhood,
        city: task.city,
        state: task.state,
        zipcode: task.zipcode
      }
    }
    
    if detailed
      data[:worker] = task.worker ? {
        id: task.worker.id,
        name: task.worker.name,
        cpf: task.worker.cpf
      } : nil
      data[:admin] = {
        id: task.admin.id,
        name: task.admin.name
      }
      data[:task_request] = {
        id: task.task_request.id,
        name: task.task_request.name,
        citizen_name: task.task_request.citizen.name
      }
      data[:created_at] = task.created_at
    end
    
    data
  end
  
  def task_request_params
    params.require(:task_request).permit(
      :name,
      :street,
      :number,
      :neighborhood,
      :city,
      :state,
      :zipcode,
      :latitude,
      :longitude
    )
  end
end
