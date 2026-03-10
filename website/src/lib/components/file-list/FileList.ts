import { dbUtils, getFile } from "$lib/db";
import { freeze } from "immer";
import { GPXFile, Track, TrackSegment, Waypoint } from "gpx";
import { selection } from "./Selection";
import { newGPXFile } from "$lib/stores";
import {
    ListLevel,
    allowedMoves,
    allowedPastes,
    ListItem,
    ListRootItem,
    ListFileItem,
    ListTrackItem,
    ListTrackSegmentItem,
    ListWaypointsItem,
    ListWaypointItem,
    sortItems
} from "./file-list-types";

export {
    ListLevel,
    allowedMoves,
    allowedPastes,
    ListItem,
    ListRootItem,
    ListFileItem,
    ListTrackItem,
    ListTrackSegmentItem,
    ListWaypointsItem,
    ListWaypointItem,
    sortItems
};

export function moveItems(fromParent: ListItem, toParent: ListItem, fromItems: ListItem[], toItems: ListItem[], remove: boolean = true) {
    if (fromItems.length === 0) {
        return;
    }

    sortItems(fromItems, false);
    sortItems(toItems, false);

    let context: (GPXFile | Track | TrackSegment | Waypoint[] | Waypoint)[] = [];
    fromItems.forEach((item) => {
        let file = getFile(item.getFileId());
        if (file) {
            if (item instanceof ListFileItem) {
                context.push(file.clone());
            } else if (item instanceof ListTrackItem && item.getTrackIndex() < file.trk.length) {
                context.push(file.trk[item.getTrackIndex()].clone());
            } else if (item instanceof ListTrackSegmentItem && item.getTrackIndex() < file.trk.length && item.getSegmentIndex() < file.trk[item.getTrackIndex()].trkseg.length) {
                context.push(file.trk[item.getTrackIndex()].trkseg[item.getSegmentIndex()].clone());
            } else if (item instanceof ListWaypointsItem) {
                context.push(file.wpt.map((wpt) => wpt.clone()));
            } else if (item instanceof ListWaypointItem && item.getWaypointIndex() < file.wpt.length) {
                context.push(file.wpt[item.getWaypointIndex()].clone());
            }
        }
    });

    if (remove && !(fromParent instanceof ListRootItem)) {
        sortItems(fromItems, true);
    }

    let files = [fromParent.getFileId(), toParent.getFileId()];
    let callbacks = [
        (file, context: (GPXFile | Track | TrackSegment | Waypoint[] | Waypoint)[]) => {
            fromItems.forEach((item) => {
                if (item instanceof ListTrackItem) {
                    file.replaceTracks(item.getTrackIndex(), item.getTrackIndex(), []);
                } else if (item instanceof ListTrackSegmentItem) {
                    file.replaceTrackSegments(item.getTrackIndex(), item.getSegmentIndex(), item.getSegmentIndex(), []);
                } else if (item instanceof ListWaypointsItem) {
                    file.replaceWaypoints(0, file.wpt.length - 1, []);
                } else if (item instanceof ListWaypointItem) {
                    file.replaceWaypoints(item.getWaypointIndex(), item.getWaypointIndex(), []);
                }
            });
        },
        (file, context: (GPXFile | Track | TrackSegment | Waypoint[] | Waypoint)[]) => {
            toItems.forEach((item, i) => {
                if (item instanceof ListTrackItem) {
                    if (context[i] instanceof Track) {
                        file.replaceTracks(item.getTrackIndex(), item.getTrackIndex() - 1, [context[i]]);
                    } else if (context[i] instanceof TrackSegment) {
                        file.replaceTracks(item.getTrackIndex(), item.getTrackIndex() - 1, [new Track({
                            trkseg: [context[i]]
                        })]);
                    }
                } else if (item instanceof ListTrackSegmentItem && context[i] instanceof TrackSegment) {
                    file.replaceTrackSegments(item.getTrackIndex(), item.getSegmentIndex(), item.getSegmentIndex() - 1, [context[i]]);
                } else if (item instanceof ListWaypointsItem) {
                    if (Array.isArray(context[i]) && context[i].length > 0 && context[i][0] instanceof Waypoint) {
                        file.replaceWaypoints(file.wpt.length, file.wpt.length - 1, context[i]);
                    } else if (context[i] instanceof Waypoint) {
                        file.replaceWaypoints(file.wpt.length, file.wpt.length - 1, [context[i]]);
                    }
                } else if (item instanceof ListWaypointItem && context[i] instanceof Waypoint) {
                    file.replaceWaypoints(item.getWaypointIndex(), item.getWaypointIndex() - 1, [context[i]]);
                }
            });
        }
    ];

    if (fromParent instanceof ListRootItem) {
        files = [];
        callbacks = [];
    } else if (!remove) {
        files.splice(0, 1);
        callbacks.splice(0, 1);
    }

    dbUtils.applyEachToFilesAndGlobal(files, callbacks, (files, context: (GPXFile | Track | TrackSegment | Waypoint[] | Waypoint)[]) => {
        toItems.forEach((item, i) => {
            if (item instanceof ListFileItem) {
                if (context[i] instanceof GPXFile) {
                    let newFile = context[i];
                    if (remove) {
                        files.delete(newFile._data.id);
                    }
                    newFile._data.id = item.getFileId();
                    files.set(item.getFileId(), freeze(newFile));
                } else if (context[i] instanceof Track) {
                    let newFile = newGPXFile();
                    newFile._data.id = item.getFileId();
                    if (context[i].name) {
                        newFile.metadata.name = context[i].name;
                    }
                    newFile.replaceTracks(0, 0, [context[i]]);
                    files.set(item.getFileId(), freeze(newFile));
                } else if (context[i] instanceof TrackSegment) {
                    let newFile = newGPXFile();
                    newFile._data.id = item.getFileId();
                    newFile.replaceTracks(0, 0, [new Track({
                        trkseg: [context[i]]
                    })]);
                    files.set(item.getFileId(), freeze(newFile));
                }
            }
        });
    }, context);

    selection.update(($selection) => {
        $selection.clear();
        toItems.forEach((item) => {
            $selection.set(item, true);
        });
        return $selection;
    });
}
