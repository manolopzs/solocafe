class ModifierOptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!, only: [:create, :update, :destroy]
  before_action :set_current_group!, only: [:index]
  before_action :set_group, only: [:create, :update, :destroy]

  def index
    options = @group.modifier_options.order(:sort_order)
    render json: { modifier_options: options.map { |o| option_payload(o) } }
  end

  def create
    option = @group.modifier_options.build(option_params)
    if option.save
      render json: { modifier_option: option_payload(option) }, status: :created
    else
      render json: { errors: option.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    option = @group.modifier_options.find(params[:id])
    if option.update(option_params)
      render json: { modifier_option: option_payload(option) }
    else
      render json: { errors: option.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    option = @group.modifier_options.find(params[:id])
    option.destroy
    head :no_content
  end

  private

  def set_current_group!
    set_current_shop!
    return if performed?

    @group = Current.shop.modifier_groups.find_by(id: params[:modifier_group_id])
    render json: { error: "Modifier group not found" }, status: :not_found if @group.nil?
  end

  def set_group
    @group = Current.shop.modifier_groups.find(params[:modifier_group_id])
  end

  def option_params
    params.require(:modifier_option).permit(:name, :price_cents, :is_active, :sort_order)
  end

  def option_payload(option)
    {
      id: option.id,
      group_id: option.group_id,
      name: option.name,
      price_cents: option.price_cents,
      is_active: option.is_active,
      sort_order: option.sort_order
    }
  end
end
