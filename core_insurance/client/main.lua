local Keys = {
    ["ESC"] = 322,
    ["F1"] = 288,
    ["F2"] = 289,
    ["F3"] = 170,
    ["F5"] = 166,
    ["F6"] = 167,
    ["F7"] = 168,
    ["F8"] = 169,
    ["F9"] = 56,
    ["F10"] = 57,
    ["~"] = 243,
    ["-"] = 84,
    ["="] = 83,
    ["BACKSPACE"] = 177,
    ["TAB"] = 37,
    ["Q"] = 44,
    ["W"] = 32,
    ["E"] = 38,
    ["R"] = 45,
    ["T"] = 245,
    ["Y"] = 246,
    ["U"] = 303,
    ["P"] = 199,
    ["["] = 39,
    ["]"] = 40,
    ["ENTER"] = 18,
    ["CAPS"] = 137,
    ["A"] = 34,
    ["S"] = 8,
    ["D"] = 9,
    ["F"] = 23,
    ["G"] = 47,
    ["H"] = 74,
    ["K"] = 311,
    ["L"] = 182,
    ["LEFTSHIFT"] = 21,
    ["Z"] = 20,
    ["X"] = 73,
    ["C"] = 26,
    ["V"] = 0,
    ["B"] = 29,
    ["N"] = 249,
    ["M"] = 244,
    [","] = 82,
    ["."] = 81,
    ["LEFTCTRL"] = 36,
    ["LEFTALT"] = 19,
    ["SPACE"] = 22,
    ["RIGHTCTRL"] = 70,
    ["HOME"] = 213,
    ["PAGEUP"] = 10,
    ["PAGEDOWN"] = 11,
    ["DELETE"] = 178,
    ["LEFT"] = 174,
    ["RIGHT"] = 175,
    ["TOP"] = 27,
    ["DOWN"] = 173,
    ["NENTER"] = 201,
    ["N4"] = 108,
    ["N5"] = 60,
    ["N6"] = 107,
    ["N+"] = 96,
    ["N-"] = 97,
    ["N7"] = 117,
    ["N8"] = 61,
    ["N9"] = 118
}

local vehicleBrands = {
    "albany",
    "annis",
    "benefactor",
    "bf",
    "bollokan",
    "bravado",
    "brute",
    "buckingham",
    "canis",
    "cheval",
    "classique ",
    "coil",
    "declasse",
    "dewbauchee",
    "dinka",
    "dundreary",
    "emperor",
    "enus",
    "fathom",
    "gallivanter",
    "grotti",
    "hijak",
    "imponte",
    "inverto",
    "jobuilt",
    "karin",
    "lampadati",
    "liberty-city-cycles",
    "maibatsu",
    "mammoth",
    "maxwell",
    "mtl",
    "nagasaki",
    "obey",
    "ocelot",
    "overflod",
    "pegassi",
    "pfister",
    "principe",
    "progen",
    "rune",
    "schyster",
    "shitzu",
    "speedophile",
    "stanley",
    "truffade",
    "ubermacht",
    "vapid",
    "vom-feuer",
    "vulcar",
    "vysser",
    "weeny",
    "willard",
    "zirconium",
    "western"
}

ESX = nil

local VehicleBeingClaimed = nil
local TimeClaiming = 0
local opened = false
local lot = nil

Citizen.CreateThread(
    function()
        while ESX == nil do
            TriggerEvent(
                "esx:getSharedObject",
                function(obj)
                    ESX = obj
                end
            )
            Citizen.Wait(0)
        end
    end
)

Citizen.CreateThread(
    function()
     
                local blip = AddBlipForCoord(Config.InsuranceDesk)

                SetBlipSprite(blip, Config.BlipCenterSprite)
                SetBlipScale(blip, 0.8)
                SetBlipColour(blip, Config.BlipCenterColor)
                SetBlipAsShortRange(blip, true)

                BeginTextCommandSetBlipName("STRING")
                AddTextComponentString(Config.BlipCenterText)
                EndTextCommandSetBlipName(blip)
           
end)

Citizen.CreateThread(
    function()
        while true do
            Citizen.Wait(1)
            local ped = PlayerPedId()
            local coords = GetEntityCoords(ped)

            local dst = #(Config.InsuranceDesk - coords)

            if dst < 10 then
                DrawText3D(
                    Config.InsuranceDesk[1],
                    Config.InsuranceDesk[2],
                    Config.InsuranceDesk[3],
                    Config.Text["desk_hologram"]
                )
                if dst < 2 and IsControlJustReleased(0, Keys["E"]) then
                    openInsurance()
                end
            else
                Citizen.Wait(500)
            end
        end
    end
)

Citizen.CreateThread(
    function()
        while true do
            Citizen.Wait(Config.InsurancePaymentInterval * 1000)

            ESX.TriggerServerCallback(
                "core_insurance:getOwnedVehicles",
                function(myVehicles, Vehicles, VehicleCategories, time)
                    local price = 0

                    for _, v in ipairs(myVehicles) do
                        if Config.InsurancePlans[v.insurance] then
                            local plan = Config.InsurancePlans[v.insurance]

                            ESX.TriggerServerCallback(
                                "core_insurance:payInsurance",
                                function(paid)
                                    if paid then
                                        price = price + plan.intervalPrice
                                    else
                                        TriggerServerEvent("core_insurance:removePlan", v.plate)
                                    end
                                end,
                                plan.intervalPrice
                            )
                        end
                    end

                    Citizen.Wait(500)

                    if price > 0 and Config.NotifyOfInsurancePayment then
                        SendTextMessage(Config.Text["inverval_payment"] .. " -" .. price .. "$")
                    end
                end
            )
        end
    end
)

Citizen.CreateThread(
    function()
        while true do
            Citizen.Wait(1000)
            if TimeClaiming > 0 then
                TimeClaiming = TimeClaiming - 1
                SendNUIMessage(
                    {
                        type = "claim",
                        time = TimeClaiming,
                        vehicle = VehicleBeingClaimed
                    }
                )

                if TimeClaiming == 0 then
                    claimVehicle(VehicleBeingClaimed)
                    VehicleBeingClaimed = nil
                end
            end

            if opened then
                SendNUIMessage(
                    {
                        type = "tick"
                    }
                )
            end
        end
    end
)

function claimVehicle(veh)
    local chosenLot = Config.Lots[lot]

    ESX.Game.SpawnVehicle(
        veh.model,
        chosenLot.coords,
        chosenLot.heading,
        function(vehicle)
            ESX.Game.SetVehicleProperties(vehicle, veh.vehicle)
            SendTextMessage(Config.Text["claimed"])

            if Config.SpawnLocked then
                SetVehicleDoorsLocked(vehicle, 2)
            end

            SetNewWaypoint(chosenLot.coords[1],  chosenLot.coords[2])
        end
    )

    TriggerServerEvent("core_insurance:setCooldown", veh.plate, Config.InsurancePlans[veh.insurance].cooldown)
    chosenLot.occupied = false
    lot = nil
end

function openInsurance()
    ESX.TriggerServerCallback(
        "core_insurance:getOwnedVehicles",
        function(myVehicles, Vehicles, VehicleCategories, time)
            local mapVehicles = {}

            if not Config.CanClaimExisting then
                for v in EnumerateVehicles() do
                    if not IsEntityDead(v) then
                        local plate = GetVehicleNumberPlateText(v)
                        mapVehicles[plate] = true
                    end
                end
            end

            for _, v in ipairs(myVehicles) do
                local model = string.lower(GetDisplayNameFromVehicleModel(tonumber(v.vehicle.model)))

                if model == "carnotfound" then
                    Citizen.Trace("ERROR: VEHICLE THAT YOU HAVE IN OWNED VEHICLES DOES NOT EXIST IN THE GAME")
                    break
                end

                v.model = model

                if not Vehicles[model] then
                    Citizen.Trace("ERROR: ONE OF YOU OWNED VEHICLES IS NOT IN VEHICLES TABLE")
                    v.category = "NOT"
                    v.name = "FOUND"
                    v.label = "NOT"
                else
                    v.category = Vehicles[model].category
                    v.name = Vehicles[model].name
                    v.label = VehicleCategories[v.category]
                    v.opacity = 1
                    v.displayCooldown = 0

                    if mapVehicles[v.plate] then
                        v.opacity = 0.6
                    end

                    if v.cooldown > 0 then
                        if time < v.cooldown then
                            v.opacity = 0.6
                            v.displayCooldown = v.cooldown - time
                        end
                    end

                    for _, g in ipairs(vehicleBrands) do
                        if g == v.category then
                        
                            v.picture =
                                "https://www.gtabase.com/images/jch-optimize/ng/images_gta-5_manufacturers_" ..
                                v.category .. ".webp"
                            break
                        end
                    end

                    if not v.picture then
                        v.picture = "img/brands/" .. v.category .. ".png"
                    end
                end
            end

            SetNuiFocus(true, true)
            TriggerScreenblurFadeIn(1000)
            SendNUIMessage(
                {
                    type = "open",
                    plans = Config.InsurancePlans,
                    vehicles = myVehicles,
                    claiming = VehicleBeingClaimed,
                    usingCredits = Config.UsingCoreCredits,
                    CanInsureNotStored = Config.CanInsureNotStored
                }
            )

            opened = true
        end
    )
end



RegisterNetEvent("core_insurance:SendTextMessage")
AddEventHandler(
    "core_insurance:SendTextMessage",
    function(msg)
        SendTextMessage(msg)
    end
)

RegisterNUICallback(
    "changePlan",
    function(data)
        local vehicle = data["vehicle"]
        local plan = data["plan"]

        TriggerServerEvent("core_insurance:changePlan", vehicle.plate, plan)
    end
)

RegisterNUICallback(
    "claim",
    function(data)
        local vehicle = data["vehicle"]
        local claimType = data["type"]

        lot = nil

        for k, v in pairs(Config.Lots) do
            if ESX.Game.IsSpawnPointClear(v.coords, 2.0) and not v.occupied then
                lot = k
                v.occupied = true
                break
            end
        end

        if lot then
            if claimType == "instant" then
                ESX.TriggerServerCallback(
                    "core_insurance:payCredits",
                    function(claim)
                        if claim then
                            TimeClaiming = 1
                            VehicleBeingClaimed = vehicle
                        else
                            Config.Lots[lot].occupied = false
                            lot = nil
                        end
                    end,
                    tonumber(Config.InsurancePlans[vehicle.insurance].claimCreditsPrice)
                )
            elseif claimType == "standard" then
                ESX.TriggerServerCallback(
                    "core_insurance:payFranchise",
                    function(claim)
                        if claim then
                            TimeClaiming = Config.InsurancePlans[vehicle.insurance].claimTime
                            VehicleBeingClaimed = vehicle
                        else
                            Config.Lots[lot].occupied = false
                            lot = nil
                        end
                    end,
                    tonumber(Config.InsurancePlans[vehicle.insurance].franchise)
                )
            end
        else
            SendTextMessage(Config.Text["occupied"])
        end
    end
)

RegisterNUICallback(
    "close",
    function(data)
        TriggerScreenblurFadeOut(1000)
        SetNuiFocus(false, false)
        opened = false
    end
)

function DrawText3D(x, y, z, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    local px, py, pz = table.unpack(GetGameplayCamCoord())
    local dist = GetDistanceBetweenCoords(px, py, pz, x, y, z, 1)

    local scale = ((1 / dist) * 2) * (1 / GetGameplayCamFov()) * 100

    if onScreen then
        SetTextColour(255, 255, 255, 255)
        SetTextScale(0.0 * scale, 0.45 * scale)
        SetTextFont(4)
        SetTextProportional(1)
        SetTextCentre(true)

        SetTextDropshadow(1, 1, 1, 1, 255)

        BeginTextCommandWidth("STRING")
        AddTextComponentString(text)
        local height = GetTextScaleHeight(0.55 * scale, 4)
        local width = EndTextCommandGetWidth(4)

        SetTextEntry("STRING")
        AddTextComponentString(text)
        EndTextCommandDisplayText(_x, _y)
    end
end

local entityEnumerator = {
    __gc = function(enum)
        if enum.destructor and enum.handle then
            enum.destructor(enum.handle)
        end
        enum.destructor = nil
        enum.handle = nil
    end
}

function GetAllVehicles()
    local ret = {}
    for veh in EnumerateVehicles() do
        table.insert(ret, veh)
    end
    return ret
end

local function EnumerateEntities(initFunc, moveFunc, disposeFunc)
    return coroutine.wrap(
        function()
            local iter, id = initFunc()
            if not id or id == 0 then
                disposeFunc(iter)
                return
            end

            local enum = {handle = iter, destructor = disposeFunc}
            setmetatable(enum, entityEnumerator)

            local next = true
            repeat
                coroutine.yield(id)
                next, id = moveFunc(iter)
            until not next

            enum.destructor, enum.handle = nil, nil
            disposeFunc(iter)
        end
    )
end

function EnumerateObjects()
    return EnumerateEntities(FindFirstObject, FindNextObject, EndFindObject)
end

function EnumeratePeds()
    return EnumerateEntities(FindFirstPed, FindNextPed, EndFindPed)
end

function EnumerateVehicles()
    return EnumerateEntities(FindFirstVehicle, FindNextVehicle, EndFindVehicle)
end

function EnumeratePickups()
    return EnumerateEntities(FindFirstPickup, FindNextPickup, EndFindPickup)
end
