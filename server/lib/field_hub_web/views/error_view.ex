defmodule FieldHubWeb.ErrorView do
  use FieldHubWeb, :view

  def render("400.json", %{message: msg}) do
    msg
  end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.html" becomes
  # "Not Found".
  def template_not_found(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
