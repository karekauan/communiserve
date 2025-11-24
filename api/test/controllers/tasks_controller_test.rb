require "test_helper"

class TasksControllerTest < ActionDispatch::IntegrationTest
  test "should get dashboard" do
    get tasks_dashboard_url
    assert_response :success
  end
end
