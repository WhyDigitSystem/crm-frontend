import { useEffect, useState } from "react";
import apiCalls from "apicall";
import useGeocode from "./useGeocode";

export default function useFetchData({ loginUserName, branchCode, orgId, finYear }) {
    const { geocodeAddress } = useGeocode();
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!loginUserName || !orgId) return;
        fetchData();
    }, [loginUserName, orgId]);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg("");

        try {
            const [leadsRes, scheduleRes] = await Promise.all([
                apiCalls(
                    "get",
                    `/transaction/getMyLeads?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`
                ),
                apiCalls(
                    "get",
                    `/activities/getScheduleAssignedUserName?assginedName=${loginUserName}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
                ),
            ]);

            const leads = leadsRes.paramObjectsMap?.myLeads || [];
            const schedules = scheduleRes.paramObjectsMap?.clientLists || [];

            const geocodedLeads = await Promise.all(
                leads.map(async (lead) => {
                    const coords = await geocodeAddress(`${lead.clientName}, ${lead.address}`);
                    return {
                        ...lead,
                        latitude: coords?.lat,
                        longitude: coords?.lng,
                        type: "MyLeads",
                    };
                })
            );

            const geocodedSchedules = await Promise.all(
                schedules.map(async (sch) => {
                    const coords = await geocodeAddress(`${sch.clientName}, ${sch.address}`);
                    return {
                        ...sch,
                        latitude: coords?.lat,
                        longitude: coords?.lng,
                        type: "Scheduled",
                    };
                })
            );

            setFilteredData([...geocodedLeads, ...geocodedSchedules]);
        } catch (err) {
            console.error(err);
            setErrorMsg("❌ Failed to fetch or geocode data.");
        } finally {
            setLoading(false);
        }
    };

    return { filteredData, loading, errorMsg, fetchData };
}
